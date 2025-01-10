import inquirer from "inquirer";
import { spawn } from "child_process";

const selectAction = async () =>
  inquirer.prompt([
    {
      name: "action",
      message: "DevServer action",
      type: "list",
      choices: [
        { name: "Start dev server (Development)", value: "start-dev" },
        { name: "Start NFS server (Development)", value: "start-nfs" },
        { name: "Start ingress (Development)", value: "start-ingress" },
        { name: "Generate nuxt files", value: "build-nuxt" },
        { name: "Init service", value: "init-service" },
        { name: "Build docker image", value: "build-docker" },
      ],
    },
  ]);

const selectServiceTarget = async (action) =>
  inquirer.prompt([
    {
      name: "target",
      message: "Target microservice",
      type: "list",
      choices: [
        { name: "CMS", value: "services.cms" },
        { name: "Account", value: "services.account" },
        { name: "Dashboard", value: "services.dashboard" },
      ],
    },
  ]);

const selectDockerImageTarget = async (action) =>
  inquirer.prompt([
    {
      name: "target",
      message: "Docker images to build",
      type: "list",
      choices: [
        { name: "GoNode", value: "deploy.gonode" },
        { name: "System Environment", value: "deploy.sysenv" },
        { name: "Microservice", value: "deploy.microservice" },
        { name: "RabbitMQ", value: "deploy.rabbitmq" },
      ],
    },
  ]);

const execCommand = async (action, target) => {
  const npmCommand = `./node_modules/.bin/dotenvx run -- npm`;
  switch (action) {
    case "init-service": {
      await spawn(
        "sh",
        ["-c", `npm install`],
        { stdio: "inherit" },
        Promise.resolve
      );
      await spawn(
        "sh",
        ["-c", `${npmCommand} run --workspace=${target} postinstall`],
        { stdio: "inherit" },
        Promise.resolve
      );
      break;
    }
    case "start-dev": {
      await spawn(
        "sh",
        ["-c", `${npmCommand} run --workspace=${target} dev`],
        { stdio: "inherit" },
        Promise.resolve
      );
      break;
    }
    case "start-nfs": {
      await spawn(
        "sh",
        ["-c", `${npmCommand} run --workspace=${target} start`],
        { stdio: "inherit" },
        Promise.resolve
      );
      break;
    }
    case "start-ingress": {
      await spawn(
        "sh",
        ["-c", `${npmCommand} run --workspace=${target} start`],
        { stdio: "inherit" },
        Promise.resolve
      );
      break;
    }
    case "build-nuxt": {
      await spawn(
        "sh",
        ["-c", `${npmCommand} run --workspace=${target} build`],
        { stdio: "inherit" },
        Promise.resolve
      );
      await spawn(
        "sh",
        ["-c", `${npmCommand} run --workspace=${target} generate`],
        { stdio: "inherit" },
        Promise.resolve
      );
      await spawn(
        "sh",
        ["-c", `${npmCommand} run --workspace=${target} preview`],
        { stdio: "inherit" },
        Promise.resolve
      );
      break;
    }
    case "build-docker": {
      await spawn(
        "sh",
        ["-c", `${npmCommand} --workspace=${target} build`],
        { stdio: "inherit" },
        Promise.resolve
      );
      break;
    }
    default:
      break;
  }
};

const errorHandler = (error) => {
  if (error.isTtyError) {
    // Prompt couldn't be rendered in the current environment
  } else {
    // Something else went wrong
  }
};

(async () => {
  const { action } = await selectAction().catch(errorHandler);
  switch (action) {
    case "init-service":
    case "start-dev":
    case "build-nuxt": {
      const { target } = await selectServiceTarget(action).catch(errorHandler);
      await execCommand(action, target).catch(errorHandler);
      break;
    }
    case "build-docker": {
      const { target } = await selectDockerImageTarget(action).catch(
        errorHandler
      );
      await execCommand(action, target).catch(errorHandler);
      break;
    }
    case "start-nfs": {
      await execCommand(action, 'deploy.nfs').catch(errorHandler);
      break;
    }
    case "start-ingress": {
      await execCommand(action, 'ingress').catch(errorHandler);
      break;
    }
    default:
      break;
  }
})();
