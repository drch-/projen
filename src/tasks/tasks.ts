import { Component } from '../component';
import { JsonFile } from '../json';
import { Project } from '../project';
import { TaskManifest, TaskSpec } from './model';
import { Task, TaskOptions } from './task';

/**
 * Defines project tasks.
 *
 * Tasks extend the projen CLI by adding subcommands to it. Task definitions are
 * synthesized into `.projen/tasks.json`.
 */
export class Tasks extends Component {
  private readonly _tasks: { [name: string]: Task };
  private readonly _env: { [name: string]: string };

  constructor(project: Project) {
    super(project);

    this._tasks = {};
    this._env = {};

    new JsonFile(project, Task.MANIFEST_FILE, {
      marker: true,
      omitEmpty: true,
      obj: {
        tasks: (() => this.renderTasks()) as any,
        env: (() => this.renderEnv()) as any,
      } as TaskManifest,
    });
  }

  /**
   * All tasks.
   */
  public get all() {
    return Object.values(this._tasks);
  }

  /**
   * Adds a task to a project.
   * @param name The name of the task
   * @param options Task options.
   */
  public addTask(name: string, options: TaskOptions = {}) {
    const task = new Task(this, name, options);
    this._tasks[name] = task;
    return task;
  }

  /**
   * Adds global environment.
   * @param name Environment variable name
   * @param value Value
   */
  public env(name: string, value: string) {
    this._env[name] = value;
  }

  /**
   * Finds a task by name. Returns `undefined` if the task cannot be found.
   * @param name The name of the task
   */
  public tryFind(name: string): undefined | Task {
    return this._tasks[name];
  }

  private renderEnv() {
    const env: { [name: string]: string } = {};
    for (const [k, v] of Object.entries(this._env)) {
      env[k] = v;
    }

    return env;
  }

  private renderTasks() {
    const tasks: { [name: string]: TaskSpec } = {};
    for (const task of Object.values(this._tasks)) {
      tasks[task.name] = task._renderSpec();
    }

    return tasks;
  }
}