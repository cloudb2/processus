# Processus

Processus is a simple lightweight workflow engine designed to help orchestrate multiple tasks.

[![Node version](https://img.shields.io/badge/node-v4.2.2LTS-green.svg)](https://nodejs.org/en/)
[![NPM version](https://img.shields.io/npm/v/processus.svg?style=flat-square)](https://www.npmjs.com/package/processus)
[![License MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/cloudb2/processus/blob/master/LICENSE)

There are many workflow engines already, but Processus makes some very specific assumptions that make it easy to quickly write simple, yet powerful
workflows.

* [Installation](#installation)
* [Overview](#overview)
  * [Workflow](#workflow)
  * [Tasks](#tasks)
* [User Guide](http://cloudb2.github.io/processus/)
* [Contributing](#contributing)

<hr>

#Getting Started

## Installation

Install using npm within your project
```
npm install --save processus
```

Install globally for use on the command line
```
npm install -g processus
```

or clone this repo
```
git clone https://github.com/cloudb2/processus
```

## Overview

A workflow in Processus is defined using JSON, which should conform to a specific structure. The best way to understand that structure is by looking at examples.

### Workflow

A workflow, in it's simplest form, is defined as follows.
```
{
  "tasks": {
  },
  "id": "[instance UUID]"
  "status": "[open|error|completed]"
}
```
Both ```id``` and ```status``` are added by Processus at execution time.

execute the above example ex1.json using the following command.
```
../bin/processus-cli -l info -f ./test/ex1.json
```

You should see something like this.
```
$ ./bin/processus-cli -l info -f ./test/ex1.json

  ____  ____   __    ___  ____  ____  ____  _  _  ____
 (  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
  ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
 (__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/

           Processus: A Simple Workflow Engine.

info: reading workflow file [./test/ex1.json]
info: ✰ Workflow [./test/ex1.json] with id [5e4993b8-563f-448e-a983-3f1e0b342d60] exited without error, but did not complete.
```
***Note***

1. You can add additional meta data to the workflow such as a name and description, but that will be ignored by Processus.
2. The status of a workflow can be open, error or completed.
3. In this example there are no tasks, so the Processus returns open, assuming that a task will be injected later. More on this later.

execute ex1 again, this time with a log level of debug.
```
../bin/processus-cli -l debug -f ./test/ex1.json
```

You should see something like this.
```
$ ./bin/processus-cli -l debug -f ./test/ex1.json

  ____  ____   __    ___  ____  ____  ____  _  _  ____
 (  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
  ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
 (__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/

           Processus: A Simple Workflow Engine.

info: reading workflow file [./test/ex1.json]
debug: checking for data directory [_data]
debug: init complete without error.
debug: save point a reached.
debug: save point c reached.
debug: Workflow returned successfully.
debug: {
  "tasks": {},
  "status": "open",
  "id": "bec87e05-d4c4-43e8-b16c-8c89215f28a2"
}
info: ✰ Workflow [./test/ex1.json] with id [bec87e05-d4c4-43e8-b16c-8c89215f28a2] exited without error, but did not complete.
```
***Note***

1. The status and id have been added by Processus
2. The workflow remains open as there are NO tasks to execute

### Tasks

Consider the following workflow.
```
{
  "tasks": {
    "say hello": {
      "blocking": true,
      "handler": "../taskhandlers/execHandler",
      "data": {
        "cmd": "echo 'hello, world'"
      }
    },
    "say hello again": {
      "blocking": true,
      "handler": "../taskhandlers/execHandler",
      "data": {
        "cmd": "echo 'hello, world again'"
      }
    }
  }
}
```
***Note***

1. The above workflow has 2 tasks ```say hello``` and ```say hello again```.
2. Each task uses a handler called ```execHandler``` which executed the command identified in the data property of the task by ```data.cmd```.

So, in short, this simple workflow will execute ```echo 'hello, world'``` and ```echo 'hello, world again'``` sequentially.

execute ex2.json
```
./bin/processus-cli -l debug -f ./test/ex2.json
```

You should see something like this.
```
$ ./bin/processus-cli -l debug -f ./test/ex2.json

  ____  ____   __    ___  ____  ____  ____  _  _  ____
 (  _ \(  _ \ /  \  / __)(  __)/ ___)/ ___)/ )( \/ ___)
  ) __/ )   /(  O )( (__  ) _) \___  \___ \) \/ (\___ \
 (__)  (__\_) \__/  \___)(____)(____/(____/\____/(____/

           Processus: A Simple Workflow Engine.

info: reading workflow file [./test/ex2.json]
debug: checking for data directory [_data]
debug: init complete without error.
debug: save point a reached.
debug: task.skipIf = undefined
debug: task.errorIf = undefined
info: ⧖ Starting task [say hello]
debug: stdout ➜ [hello, world
]
info: ✔ task [say hello] completed successfully.
debug: save point a reached.
debug: task.skipIf = undefined
debug: task.errorIf = undefined
info: ⧖ Starting task [say hello again]
debug: stdout ➜ [hello, world again
]
info: ✔ task [say hello again] completed successfully.
debug: save point a reached.
debug: save point c reached.
debug: Workflow returned successfully.
debug: {
  "tasks": {
    "say hello": {
      "blocking": true,
      "handler": "../taskhandlers/execHandler",
      "data": {
        "cmd": "echo 'hello, world'",
        "stdout": "hello, world\n",
        "stderr": ""
      },
      "status": "completed",
      "timeOpened": 1447974872204,
      "timeStarted": 1447974872206,
      "timeCompleted": 1447974872224,
      "handlerDuration": 18,
      "totalDuration": 20
    },
    "say hello again": {
      "blocking": true,
      "handler": "../taskhandlers/execHandler",
      "data": {
        "cmd": "echo 'hello, world again'",
        "stdout": "hello, world again\n",
        "stderr": ""
      },
      "status": "completed",
      "timeOpened": 1447974872225,
      "timeStarted": 1447974872226,
      "timeCompleted": 1447974872235,
      "handlerDuration": 9,
      "totalDuration": 10
    }
  },
  "status": "completed",
  "id": "e83de778-d64b-403f-b29d-c305c9f854dd"
}
info: ✰ Workflow [./test/ex2.json] with id [e83de778-d64b-403f-b29d-c305c9f854dd] completed successfully.
```
***Note***

1. The handler has added ```stdout``` and ```stderr``` to each task's ```data``` property.
2. The status of each task and the overall workflow is shown as ```completed```
3. Processus has added additional timing information to each task.
4. The status of a task can be one of the following
  * ```waiting``` It is waiting to be opened by Processus
  * ```open``` It is opened by Processus
  * ```executing``` The handler associated with this task is currently executing
  * ```completed``` The task has completed successfully
  * ```pending``` A handler has finished executing but a response is pending. i.e. it is expected that the workflow will be updated at some point in the future from an async callback.
  * ```error``` An error occured during execution of the handler

See the [User Guide](http://cloudb2.github.io/processus/) for much more!

## Contributing

Yes, please.

Make a pull requests and ensure you can run ```./runtests.sh``` successfully. Please add additional tests for any new features/mods you make.

### Roadmap
* Workflow Persistence Plugin Architecture
  * Add Mongodb persistence type
* Full REST API to interact with Processus
  * Swagger yaml
