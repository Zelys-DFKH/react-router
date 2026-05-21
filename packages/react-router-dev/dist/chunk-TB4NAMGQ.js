/**
 * @react-router/dev v7.15.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
import {
  configRoutesToRouteManifest,
  setAppDirectory,
  validateRouteConfig
} from "./chunk-ZZD5RYKL.js";
import {
  getVite,
  isReactRouterRepo,
  preloadVite
} from "./chunk-RFCUZV3T.js";
import {
  __export
} from "./chunk-QI2ZSS2B.js";

// vite/ssr-externals.ts
var ssrExternals = isReactRouterRepo() ? [
  // This is only needed within this repo because these packages
  // are linked to a directory outside of node_modules so Vite
  // treats them as internal code by default.
  "react-router",
  "@react-router/architect",
  "@react-router/cloudflare",
  "@react-router/dev",
  "@react-router/express",
  "@react-router/node",
  "@react-router/serve"
] : void 0;

// config/config.ts
import fs from "fs";
import { execSync } from "child_process";
import { createRequire } from "module";

// vite/vite-node.ts
async function createContext({
  root,
  mode,
  customLogger
}) {
  await preloadVite();
  const vite = getVite();
  const [{ ViteNodeServer }, { ViteNodeRunner }, { installSourcemapsSupport }] = await Promise.all([
    import("vite-node/server"),
    import("vite-node/client"),
    import("vite-node/source-map")
  ]);
  const devServer = await vite.createServer({
    root,
    mode,
    customLogger,
    server: {
      preTransformRequests: false,
      hmr: false,
      watch: null
    },
    ssr: {
      external: ssrExternals
    },
    optimizeDeps: {
      noDiscovery: true
    },
    css: {
      // This empty PostCSS config object prevents the PostCSS config file from
      // being loaded. We don't need it in a React Router config context, and
      // there's also an issue in Vite 5 when using a .ts PostCSS config file in
      // an ESM project: https://github.com/vitejs/vite/issues/15869. Consumers
      // can work around this in their own Vite config file, but they can't
      // configure this internal usage of vite-node.
      postcss: {}
    },
    configFile: false,
    envFile: false,
    plugins: []
  });
  await devServer.pluginContainer.buildStart({});
  const server = new ViteNodeServer(devServer);
  installSourcemapsSupport({
    getSourceMap: (source) => server.getSourceMap(source)
  });
  const runner = new ViteNodeRunner({
    root: devServer.config.root,
    base: devServer.config.base,
    fetchModule(id) {
      return server.fetchModule(id);
    },
    resolveId(id, importer) {
      return server.resolveId(id, importer);
    }
  });
  return { devServer, server, runner };
}

// config/config.ts
import Path from "pathe";
import chokidar from "chokidar";
import { readPackageJSON, sortPackage, updatePackage } from "pkg-types";
import colors from "picocolors";
import pick from "lodash/pick.js";
import omit from "lodash/omit.js";
import cloneDeep from "lodash/cloneDeep.js";
import isEqual from "lodash/isEqual.js";

// cli/detectPackageManager.ts
var detectPackageManager = () => {
  let { npm_config_user_agent } = process.env;
  if (!npm_config_user_agent) return void 0;
  try {
    let pkgManager = npm_config_user_agent.split("/")[0];
    if (pkgManager === "npm") return "npm";
    if (pkgManager === "pnpm") return "pnpm";
    if (pkgManager === "yarn") return "yarn";
    if (pkgManager === "bun") return "bun";
    return void 0;
  } catch {
    return void 0;
  }
};

// config/config.ts
var nodeRequire = createRequire(import.meta.url);
var excludedConfigPresetKeys = ["presets"];
var branchRouteProperties = [
  "id",
  "path",
  "file",
  "index"
];
var configRouteToBranchRoute = (configRoute) => pick(configRoute, branchRouteProperties);
var mergeReactRouterConfig = (...configs) => {
  let reducer = (configA, configB) => {
    let mergeRequired = (key) => configA[key] !== void 0 && configB[key] !== void 0;
    return {
      ...configA,
      ...configB,
      ...mergeRequired("buildEnd") ? {
        buildEnd: async (...args) => {
          await Promise.all([
            configA.buildEnd?.(...args),
            configB.buildEnd?.(...args)
          ]);
        }
      } : {},
      ...mergeRequired("future") ? {
        future: {
          ...configA.future,
          ...configB.future
        }
      } : {},
      ...mergeRequired("presets") ? {
        presets: [...configA.presets ?? [], ...configB.presets ?? []]
      } : {}
    };
  };
  return configs.reduce(reducer, {});
};
var deepFreeze = (o) => {
  Object.freeze(o);
  let oIsFunction = typeof o === "function";
  let hasOwnProp = Object.prototype.hasOwnProperty;
  Object.getOwnPropertyNames(o).forEach(function(prop) {
    if (hasOwnProp.call(o, prop) && (oIsFunction ? prop !== "caller" && prop !== "callee" && prop !== "arguments" : true) && o[prop] !== null && (typeof o[prop] === "object" || typeof o[prop] === "function") && !Object.isFrozen(o[prop])) {
      deepFreeze(o[prop]);
    }
  });
  return o;
};
function ok(value) {
  return { ok: true, value };
}
function err(error) {
  return { ok: false, error };
}
async function resolveConfig({
  root,
  viteNodeContext,
  reactRouterConfigFile,
  skipRoutes,
  validateConfig
}) {
  let reactRouterUserConfig = {};
  if (reactRouterConfigFile) {
    try {
      if (!fs.existsSync(reactRouterConfigFile)) {
        return err(`${reactRouterConfigFile} no longer exists`);
      }
      let configModule = await viteNodeContext.runner.executeFile(
        reactRouterConfigFile
      );
      if (configModule.default === void 0) {
        return err(`${reactRouterConfigFile} must provide a default export`);
      }
      if (typeof configModule.default !== "object") {
        return err(`${reactRouterConfigFile} must export a config`);
      }
      reactRouterUserConfig = configModule.default;
      if (validateConfig) {
        const error = validateConfig(reactRouterUserConfig);
        if (error) {
          return err(error);
        }
      }
    } catch (error) {
      return err(`Error loading ${reactRouterConfigFile}: ${error}`);
    }
  }
  reactRouterUserConfig = deepFreeze(cloneDeep(reactRouterUserConfig));
  let presets = (await Promise.all(
    (reactRouterUserConfig.presets ?? []).map(async (preset) => {
      if (!preset.name) {
        throw new Error(
          "React Router presets must have a `name` property defined."
        );
      }
      if (!preset.reactRouterConfig) {
        return null;
      }
      let configPreset = omit(
        await preset.reactRouterConfig({ reactRouterUserConfig }),
        excludedConfigPresetKeys
      );
      return configPreset;
    })
  )).filter(function isNotNull(value) {
    return value !== null;
  });
  let defaults = {
    basename: "/",
    buildDirectory: "build",
    serverBuildFile: "index.js",
    serverModuleFormat: "esm",
    ssr: true
  };
  let userAndPresetConfigs = mergeReactRouterConfig(
    ...presets,
    reactRouterUserConfig
  );
  let {
    appDirectory: userAppDirectory,
    basename: basename2,
    buildDirectory: userBuildDirectory,
    buildEnd,
    prerender,
    routeDiscovery: userRouteDiscovery,
    serverBuildFile,
    serverBundles,
    serverModuleFormat,
    ssr
  } = {
    ...defaults,
    // Default values should be completely overridden by user/preset config, not merged
    ...userAndPresetConfigs
  };
  if (!ssr && serverBundles) {
    serverBundles = void 0;
  }
  if (prerender) {
    let isValidPrerenderPathsConfig = (p) => typeof p === "boolean" || typeof p === "function" || Array.isArray(p);
    let isValidPrerenderConfig = isValidPrerenderPathsConfig(prerender) || typeof prerender === "object" && "paths" in prerender && isValidPrerenderPathsConfig(prerender.paths);
    if (!isValidPrerenderConfig) {
      return err(
        "The `prerender`/`prerender.paths` config must be a boolean, an array of string paths, or a function returning a boolean or array of string paths."
      );
    }
    if (typeof prerender === "object" && "unstable_concurrency" in prerender) {
      return err(
        "The `prerender.unstable_concurrency` config field has been stabilized as `prerender.concurrency`"
      );
    }
    let isValidConcurrencyConfig = typeof prerender != "object" || !("concurrency" in prerender) || typeof prerender.concurrency === "number" && Number.isInteger(prerender.concurrency) && prerender.concurrency > 0;
    if (!isValidConcurrencyConfig) {
      return err(
        "The `prerender.concurrency` config must be a positive integer if specified."
      );
    }
  }
  let routeDiscovery;
  if (userRouteDiscovery == null) {
    if (ssr) {
      routeDiscovery = {
        mode: "lazy",
        manifestPath: "/__manifest"
      };
    } else {
      routeDiscovery = { mode: "initial" };
    }
  } else if (userRouteDiscovery.mode === "initial") {
    routeDiscovery = userRouteDiscovery;
  } else if (userRouteDiscovery.mode === "lazy") {
    if (!ssr) {
      return err(
        'The `routeDiscovery.mode` config cannot be set to "lazy" when setting `ssr:false`'
      );
    }
    let { manifestPath } = userRouteDiscovery;
    if (manifestPath != null && !manifestPath.startsWith("/")) {
      return err(
        'The `routeDiscovery.manifestPath` config must be a root-relative pathname beginning with a slash (i.e., "/__manifest")'
      );
    }
    routeDiscovery = userRouteDiscovery;
  }
  let appDirectory = Path.resolve(root, userAppDirectory || "app");
  let buildDirectory = Path.resolve(root, userBuildDirectory);
  let rootRouteFile = findEntry(appDirectory, "root", { absolute: true });
  if (!rootRouteFile) {
    let rootRouteDisplayPath = Path.relative(
      root,
      Path.join(appDirectory, "root.tsx")
    );
    return err(
      `Could not find a root route module in the app directory as "${rootRouteDisplayPath}"`
    );
  }
  let routes;
  let routeConfig = [];
  if (skipRoutes) {
    routes = {};
  } else {
    let routeConfigFile = findEntry(appDirectory, "routes");
    try {
      if (!routeConfigFile) {
        let routeConfigDisplayPath = Path.relative(
          root,
          Path.join(appDirectory, "routes.ts")
        );
        return err(
          `Route config file not found at "${routeConfigDisplayPath}".`
        );
      }
      setAppDirectory(appDirectory);
      let routeConfigExport = (await viteNodeContext.runner.executeFile(
        Path.join(appDirectory, routeConfigFile)
      )).default;
      let result = validateRouteConfig({
        routeConfigFile,
        routeConfig: await routeConfigExport
      });
      if (!result.valid) {
        return err(result.message);
      }
      routeConfig = [
        {
          id: "root",
          path: "",
          file: Path.relative(appDirectory, rootRouteFile),
          children: result.routeConfig
        }
      ];
      routes = configRoutesToRouteManifest(appDirectory, routeConfig);
    } catch (error) {
      return err(
        [
          colors.red(`Route config in "${routeConfigFile}" is invalid.`),
          "",
          error.loc?.file && error.loc?.column && error.frame ? [
            Path.relative(appDirectory, error.loc.file) + ":" + error.loc.line + ":" + error.loc.column,
            error.frame.trim?.()
          ] : error.stack
        ].flat().join("\n")
      );
    }
  }
  let futureConfig = userAndPresetConfigs.future;
  if (futureConfig) {
    if ("unstable_splitRouteModules" in futureConfig) {
      return err(
        "The `future.unstable_splitRouteModules` flag has been stabilized as `future.v8_splitRouteModules`"
      );
    }
    if ("unstable_viteEnvironmentApi" in futureConfig || "v8_viteEnvironmentApi" in futureConfig) {
      return err(
        "The `future.v8_viteEnvironmentApi` flag has been removed because Vite Environment API usage is now always enabled"
      );
    }
    if ("unstable_passThroughRequests" in futureConfig) {
      return err(
        "The `future.unstable_passThroughRequests` flag has been stabilized as `future.v8_passThroughRequests`"
      );
    }
    if ("unstable_subResourceIntegrity" in futureConfig) {
      return err(
        "The `future.unstable_subResourceIntegrity` flag has been stabilized and moved to a top-level `config.subResourceIntegrity` field"
      );
    }
  }
  let future = {
    unstable_optimizeDeps: userAndPresetConfigs.future?.unstable_optimizeDeps ?? false,
    v8_passThroughRequests: userAndPresetConfigs.future?.v8_passThroughRequests ?? false,
    unstable_trailingSlashAwareDataRequests: userAndPresetConfigs.future?.unstable_trailingSlashAwareDataRequests ?? false,
    v8_middleware: userAndPresetConfigs.future?.v8_middleware ?? false,
    v8_splitRouteModules: userAndPresetConfigs.future?.v8_splitRouteModules ?? false
  };
  let allowedActionOrigins = userAndPresetConfigs.allowedActionOrigins ?? false;
  let subResourceIntegrity = userAndPresetConfigs.subResourceIntegrity ?? false;
  let reactRouterConfig = deepFreeze({
    appDirectory,
    basename: basename2,
    buildDirectory,
    buildEnd,
    future,
    prerender,
    routes,
    routeDiscovery,
    serverBuildFile,
    serverBundles,
    serverModuleFormat,
    ssr,
    subResourceIntegrity,
    allowedActionOrigins,
    unstable_routeConfig: routeConfig
  });
  for (let preset of reactRouterUserConfig.presets ?? []) {
    await preset.reactRouterConfigResolved?.({ reactRouterConfig });
  }
  logFutureFlagWarnings(userAndPresetConfigs.future || {});
  return ok(reactRouterConfig);
}
function logFutureFlagWarning(flag, message) {
  console.log(
    colors.yellow(
      `  \u26A0\uFE0F  Future Flag Warning: ${message}
     You can use the \`future.${flag}\` flag to opt in early.
     -> https://reactrouter.com/upgrading/future-flags#${flag}`
    )
  );
}
function logFutureFlagWarnings(future) {
  if (future.v8_middleware === void 0) {
    logFutureFlagWarning(
      "v8_middleware",
      "Route middleware support is changing in React Router v8."
    );
  }
  if (future.v8_splitRouteModules === void 0) {
    logFutureFlagWarning(
      "v8_splitRouteModules",
      "Route module splitting behavior is changing in React Router v8."
    );
  }
  if (future.v8_passThroughRequests === void 0) {
    logFutureFlagWarning(
      "v8_passThroughRequests",
      "Request handling behavior is changing in React Router v8."
    );
  }
}
async function createConfigLoader({
  rootDirectory: root,
  watch: watch2,
  mode,
  skipRoutes,
  validateConfig
}) {
  root = Path.normalize(root ?? process.env.REACT_ROUTER_ROOT ?? process.cwd());
  let vite = await import("vite");
  let viteNodeContext = await createContext({
    root,
    mode,
    // Filter out any info level logs from vite-node
    customLogger: vite.createLogger("warn", {
      prefix: "[react-router]"
    })
  });
  let reactRouterConfigFile;
  let updateReactRouterConfigFile = () => {
    reactRouterConfigFile = findEntry(root, "react-router.config", {
      absolute: true
    });
  };
  updateReactRouterConfigFile();
  let getConfig = () => resolveConfig({
    root,
    viteNodeContext,
    reactRouterConfigFile,
    skipRoutes,
    validateConfig
  });
  let appDirectory;
  let initialConfigResult = await getConfig();
  if (!initialConfigResult.ok) {
    throw new Error(initialConfigResult.error);
  }
  appDirectory = Path.normalize(initialConfigResult.value.appDirectory);
  let currentConfig = initialConfigResult.value;
  let fsWatcher;
  let changeHandlers = [];
  return {
    getConfig,
    onChange: (handler) => {
      if (!watch2) {
        throw new Error(
          "onChange is not supported when watch mode is disabled"
        );
      }
      changeHandlers.push(handler);
      if (!fsWatcher) {
        fsWatcher = chokidar.watch([root, appDirectory], {
          ignoreInitial: true,
          ignored: (path) => isIgnoredByWatcher(path, { root, appDirectory })
        });
        fsWatcher.on("error", (error) => {
          let message = error instanceof Error ? error.message : String(error);
          console.warn(colors.yellow(`File watcher error: ${message}`));
        });
        fsWatcher.on("all", async (...args) => {
          let [event, rawFilepath] = args;
          let filepath = Path.normalize(rawFilepath);
          let fileAddedOrRemoved = event === "add" || event === "unlink";
          let appFileAddedOrRemoved = fileAddedOrRemoved && filepath.startsWith(Path.normalize(appDirectory));
          let rootRelativeFilepath = Path.relative(root, filepath);
          let configFileAddedOrRemoved = fileAddedOrRemoved && isEntryFile("react-router.config", rootRelativeFilepath);
          if (configFileAddedOrRemoved) {
            updateReactRouterConfigFile();
          }
          let moduleGraphChanged = configFileAddedOrRemoved || Boolean(
            viteNodeContext.devServer?.moduleGraph.getModuleById(filepath)
          );
          if (!moduleGraphChanged && !appFileAddedOrRemoved) {
            return;
          }
          viteNodeContext.devServer?.moduleGraph.invalidateAll();
          viteNodeContext.runner?.moduleCache.clear();
          let result = await getConfig();
          let prevAppDirectory = appDirectory;
          appDirectory = Path.normalize(
            (result.value ?? currentConfig).appDirectory
          );
          if (appDirectory !== prevAppDirectory) {
            fsWatcher.unwatch(prevAppDirectory);
            fsWatcher.add(appDirectory);
          }
          let configCodeChanged = configFileAddedOrRemoved || reactRouterConfigFile !== void 0 && isEntryFileDependency(
            viteNodeContext.devServer.moduleGraph,
            reactRouterConfigFile,
            filepath
          );
          let routeConfigFile = !skipRoutes ? findEntry(appDirectory, "routes", {
            absolute: true
          }) : void 0;
          let routeConfigCodeChanged = routeConfigFile !== void 0 && isEntryFileDependency(
            viteNodeContext.devServer.moduleGraph,
            routeConfigFile,
            filepath
          );
          let configChanged = result.ok && !isEqual(omitRoutes(currentConfig), omitRoutes(result.value));
          let routeConfigChanged = result.ok && !isEqual(currentConfig?.routes, result.value.routes);
          for (let handler2 of changeHandlers) {
            handler2({
              result,
              configCodeChanged,
              routeConfigCodeChanged,
              configChanged,
              routeConfigChanged,
              path: filepath,
              event
            });
          }
          if (result.ok) {
            currentConfig = result.value;
          }
        });
      }
      return () => {
        changeHandlers = changeHandlers.filter(
          (changeHandler) => changeHandler !== handler
        );
      };
    },
    close: async () => {
      changeHandlers = [];
      await viteNodeContext.devServer.close();
      await fsWatcher?.close();
    }
  };
}
async function loadConfig({
  rootDirectory,
  mode,
  skipRoutes
}) {
  let configLoader = await createConfigLoader({
    rootDirectory,
    mode,
    skipRoutes,
    watch: false
  });
  let config = await configLoader.getConfig();
  await configLoader.close();
  return config;
}
async function resolveEntryFiles({
  rootDirectory,
  reactRouterConfig
}) {
  let { appDirectory } = reactRouterConfig;
  let defaultsDirectory = Path.resolve(
    Path.dirname(nodeRequire.resolve("@react-router/dev/package.json")),
    "dist",
    "config",
    "defaults"
  );
  let userEntryClientFile = findEntry(appDirectory, "entry.client");
  let userEntryServerFile = findEntry(appDirectory, "entry.server");
  let entryServerFile;
  let entryClientFile = userEntryClientFile || "entry.client.tsx";
  if (userEntryServerFile) {
    entryServerFile = userEntryServerFile;
  } else {
    let packageJsonPath = findEntry(rootDirectory, "package", {
      extensions: [".json"],
      absolute: true,
      walkParents: true
    });
    if (!packageJsonPath) {
      throw new Error(
        `Could not find package.json in ${rootDirectory} or any of its parent directories. Please add a package.json, or provide a custom entry.server.tsx/jsx file in your app directory.`
      );
    }
    let packageJsonDirectory = Path.dirname(packageJsonPath);
    let pkgJson = await readPackageJSON(packageJsonDirectory);
    let deps = pkgJson.dependencies ?? {};
    if (!deps["@react-router/node"]) {
      throw new Error(
        `Could not determine server runtime. Please install @react-router/node, or provide a custom entry.server.tsx/jsx file in your app directory.`
      );
    }
    if (!deps["isbot"]) {
      console.log(
        "adding `isbot@5` to your package.json, you should commit this change"
      );
      await updatePackage(packageJsonPath, (pkg) => {
        pkg.dependencies ??= {};
        pkg.dependencies.isbot = "^5";
        sortPackage(pkg);
      });
      let packageManager = detectPackageManager() ?? "npm";
      execSync(`${packageManager} install`, {
        cwd: packageJsonDirectory,
        stdio: "inherit"
      });
    }
    entryServerFile = `entry.server.node.tsx`;
  }
  let entryClientFilePath = userEntryClientFile ? Path.resolve(reactRouterConfig.appDirectory, userEntryClientFile) : Path.resolve(defaultsDirectory, entryClientFile);
  let entryServerFilePath = userEntryServerFile ? Path.resolve(reactRouterConfig.appDirectory, userEntryServerFile) : Path.resolve(defaultsDirectory, entryServerFile);
  return { entryClientFilePath, entryServerFilePath };
}
async function resolveRSCEntryFiles({
  reactRouterConfig
}) {
  let { appDirectory } = reactRouterConfig;
  let defaultsDirectory = Path.resolve(
    Path.dirname(nodeRequire.resolve("@react-router/dev/package.json")),
    "dist",
    "config",
    "default-rsc-entries"
  );
  let userEntryClientFile = findEntry(appDirectory, "entry.client", {
    absolute: true
  });
  let userEntryRSCFile = findEntry(appDirectory, "entry.rsc", {
    absolute: true
  });
  let userEntrySSRFile = findEntry(appDirectory, "entry.ssr", {
    absolute: true
  });
  let client = userEntryClientFile ?? Path.join(defaultsDirectory, "entry.client.tsx");
  let rsc = userEntryRSCFile ?? Path.join(defaultsDirectory, "entry.rsc.tsx");
  let ssr = userEntrySSRFile ?? Path.join(defaultsDirectory, "entry.ssr.tsx");
  return { client, rsc, ssr };
}
function omitRoutes(config) {
  return {
    ...config,
    routes: {}
  };
}
var entryExts = [".js", ".jsx", ".ts", ".tsx", ".mjs", ".mts"];
function isEntryFile(entryBasename, filename2) {
  return entryExts.some((ext) => filename2 === `${entryBasename}${ext}`);
}
function findEntry(dir, basename2, options) {
  let currentDir = Path.resolve(dir);
  let { root } = Path.parse(currentDir);
  while (true) {
    for (let ext of options?.extensions ?? entryExts) {
      let file = Path.resolve(currentDir, basename2 + ext);
      if (fs.existsSync(file)) {
        return options?.absolute ?? false ? file : Path.relative(dir, file);
      }
    }
    if (!options?.walkParents) {
      return void 0;
    }
    let parentDir = Path.dirname(currentDir);
    if (currentDir === root || parentDir === currentDir) {
      return void 0;
    }
    currentDir = parentDir;
  }
}
function isEntryFileDependency(moduleGraph, entryFilepath, filepath, visited = /* @__PURE__ */ new Set()) {
  entryFilepath = Path.normalize(entryFilepath);
  filepath = Path.normalize(filepath);
  if (visited.has(filepath)) {
    return false;
  }
  visited.add(filepath);
  if (filepath === entryFilepath) {
    return true;
  }
  let mod = moduleGraph.getModuleById(filepath);
  if (!mod) {
    return false;
  }
  for (let importer of mod.importers) {
    if (!importer.id) {
      continue;
    }
    if (importer.id === entryFilepath || isEntryFileDependency(moduleGraph, entryFilepath, importer.id, visited)) {
      return true;
    }
  }
  return false;
}
function isIgnoredByWatcher(path, { root, appDirectory }) {
  let dirname3 = Path.dirname(path);
  let ignoredByPath = !dirname3.startsWith(appDirectory) && // Ensure we're only watching files outside of the app directory
  // that are at the root level, not nested in subdirectories
  path !== root && // Watch the root directory itself
  dirname3 !== root;
  if (ignoredByPath) {
    return true;
  }
  try {
    let stat = fs.statSync(path, { throwIfNoEntry: false });
    if (stat && !stat.isFile() && !stat.isDirectory()) {
      return true;
    }
  } catch {
    return true;
  }
  return false;
}

// vite/babel.ts
var babel_exports = {};
__export(babel_exports, {
  generate: () => generate,
  parse: () => parse,
  t: () => t,
  traverse: () => traverse
});
import { parse } from "@babel/parser";
import * as t from "@babel/types";
import _traverse from "@babel/traverse";
import _generate from "@babel/generator";
var traverse = _traverse.default;
var generate = _generate.default;

// typegen/index.ts
import fs2 from "fs/promises";
import * as Path3 from "pathe";
import pc from "picocolors";

// typegen/context.ts
async function createContext2({
  rootDirectory,
  watch: watch2,
  mode,
  rsc
}) {
  const configLoader = await createConfigLoader({ rootDirectory, mode, watch: watch2 });
  const configResult = await configLoader.getConfig();
  if (!configResult.ok) {
    throw new Error(configResult.error);
  }
  const config = configResult.value;
  return {
    configLoader,
    rootDirectory,
    config,
    rsc
  };
}

// typegen/generate.ts
import ts from "dedent";
import * as Path2 from "pathe";
import * as Pathe from "pathe/utils";

// typegen/params.ts
function parse2(fullpath2) {
  const result = {};
  let segments = fullpath2.split("/");
  segments.forEach((segment) => {
    const match = segment.match(/^:([\w-]+)(\?)?/);
    if (!match) return;
    const param = match[1];
    const isRequired = match[2] === void 0;
    result[param] ||= isRequired;
    return;
  });
  const hasSplat = segments.at(-1) === "*";
  if (hasSplat) result["*"] = true;
  return result;
}

// typegen/route.ts
function lineage(routes, route) {
  const result = [];
  while (route) {
    result.push(route);
    if (!route.parentId) break;
    route = routes[route.parentId];
  }
  result.reverse();
  return result;
}
function fullpath(lineage2) {
  const route = lineage2.at(-1);
  if (lineage2.length === 1 && route?.id === "root") return "/";
  const isLayout = route && route.index !== true && route.path === void 0;
  if (isLayout) return void 0;
  return "/" + lineage2.map((route2) => route2.path?.replace(/^\//, "")?.replace(/\/$/, "")).filter((path) => path !== void 0 && path !== "").join("/");
}

// typegen/generate.ts
function typesDirectory(ctx) {
  return Path2.join(ctx.rootDirectory, ".react-router/types");
}
function generateFuture(ctx) {
  const filename2 = Path2.join(typesDirectory(ctx), "+future.ts");
  const content = ts`
    // Generated by React Router

    import "react-router";

    declare module "react-router" {
      interface Future {
        v8_middleware: ${ctx.config.future.v8_middleware}
      }
    }
  `;
  return { filename: filename2, content };
}
function generateServerBuild(ctx) {
  const filename2 = Path2.join(typesDirectory(ctx), "+server-build.d.ts");
  const content = ts`
    // Generated by React Router

    declare module "virtual:react-router/server-build" {
      import { ServerBuild } from "react-router";
      export const assets: ServerBuild["assets"];
      export const assetsBuildDirectory: ServerBuild["assetsBuildDirectory"];
      export const basename: ServerBuild["basename"];
      export const entry: ServerBuild["entry"];
      export const future: ServerBuild["future"];
      export const isSpaMode: ServerBuild["isSpaMode"];
      export const prerender: ServerBuild["prerender"];
      export const publicPath: ServerBuild["publicPath"];
      export const routeDiscovery: ServerBuild["routeDiscovery"];
      export const routes: ServerBuild["routes"];
      export const ssr: ServerBuild["ssr"];
      export const allowedActionOrigins: ServerBuild["allowedActionOrigins"];
      export const unstable_getCriticalCss: ServerBuild["unstable_getCriticalCss"];
    }
  `;
  return { filename: filename2, content };
}
var { t: t2 } = babel_exports;
function generateRoutes(ctx) {
  const fileToRoutes = /* @__PURE__ */ new Map();
  const lineages = /* @__PURE__ */ new Map();
  const allPages = /* @__PURE__ */ new Set();
  const routeToPages = /* @__PURE__ */ new Map();
  for (const route of Object.values(ctx.config.routes)) {
    let routeIds = fileToRoutes.get(route.file);
    if (!routeIds) {
      routeIds = /* @__PURE__ */ new Set();
      fileToRoutes.set(route.file, routeIds);
    }
    routeIds.add(route.id);
    const lineage2 = lineage(ctx.config.routes, route);
    lineages.set(route.id, lineage2);
    const fullpath2 = fullpath(lineage2);
    if (!fullpath2) continue;
    const pages = expand(fullpath2);
    pages.forEach((page) => allPages.add(page));
    lineage2.forEach(({ id }) => {
      let routePages = routeToPages.get(id);
      if (!routePages) {
        routePages = /* @__PURE__ */ new Set();
        routeToPages.set(id, routePages);
      }
      pages.forEach((page) => routePages.add(page));
    });
  }
  const routesTs = {
    filename: Path2.join(typesDirectory(ctx), "+routes.ts"),
    content: ts`
        // Generated by React Router

        import "react-router"

        declare module "react-router" {
          interface Register {
            pages: Pages
            routeFiles: RouteFiles
            routeModules: RouteModules
          }
        }
      ` + "\n\n" + generate(pagesType(allPages)).code + "\n\n" + generate(routeFilesType({ fileToRoutes, routeToPages })).code + "\n\n" + generate(routeModulesType(ctx)).code
  };
  const allAnnotations = Array.from(fileToRoutes.entries()).filter(([file]) => isInAppDirectory(ctx, file)).map(
    ([file, routeIds]) => getRouteAnnotations({ ctx, file, routeIds, lineages })
  );
  return [routesTs, ...allAnnotations];
}
function pagesType(pages) {
  return t2.tsTypeAliasDeclaration(
    t2.identifier("Pages"),
    null,
    t2.tsTypeLiteral(
      Array.from(pages).map((page) => {
        return t2.tsPropertySignature(
          t2.stringLiteral(page),
          t2.tsTypeAnnotation(
            t2.tsTypeLiteral([
              t2.tsPropertySignature(
                t2.identifier("params"),
                t2.tsTypeAnnotation(paramsType(page))
              )
            ])
          )
        );
      })
    )
  );
}
function routeFilesType({
  fileToRoutes,
  routeToPages
}) {
  return t2.tsTypeAliasDeclaration(
    t2.identifier("RouteFiles"),
    null,
    t2.tsTypeLiteral(
      Array.from(fileToRoutes).map(
        ([file, routeIds]) => t2.tsPropertySignature(
          t2.stringLiteral(file),
          t2.tsTypeAnnotation(
            t2.tsUnionType(
              Array.from(routeIds).map((routeId) => {
                const pages = routeToPages.get(routeId) ?? /* @__PURE__ */ new Set();
                return t2.tsTypeLiteral([
                  t2.tsPropertySignature(
                    t2.identifier("id"),
                    t2.tsTypeAnnotation(
                      t2.tsLiteralType(t2.stringLiteral(routeId))
                    )
                  ),
                  t2.tsPropertySignature(
                    t2.identifier("page"),
                    t2.tsTypeAnnotation(
                      pages.size > 0 ? t2.tsUnionType(
                        Array.from(pages).map(
                          (page) => t2.tsLiteralType(t2.stringLiteral(page))
                        )
                      ) : t2.tsNeverKeyword()
                    )
                  )
                ]);
              })
            )
          )
        )
      )
    )
  );
}
function routeModulesType(ctx) {
  return t2.tsTypeAliasDeclaration(
    t2.identifier("RouteModules"),
    null,
    t2.tsTypeLiteral(
      Object.values(ctx.config.routes).map(
        (route) => t2.tsPropertySignature(
          t2.stringLiteral(route.id),
          t2.tsTypeAnnotation(
            isInAppDirectory(ctx, route.file) ? t2.tsTypeQuery(
              t2.tsImportType(
                t2.stringLiteral(
                  `./${Path2.relative(ctx.rootDirectory, ctx.config.appDirectory)}/${route.file}`
                )
              )
            ) : t2.tsUnknownKeyword()
          )
        )
      )
    )
  );
}
function isInAppDirectory(ctx, routeFile) {
  const path = Path2.resolve(ctx.config.appDirectory, routeFile);
  return path.startsWith(ctx.config.appDirectory);
}
function getRouteAnnotations({
  ctx,
  file,
  routeIds,
  lineages
}) {
  const filename2 = Path2.join(
    typesDirectory(ctx),
    Path2.relative(ctx.rootDirectory, ctx.config.appDirectory),
    Path2.dirname(file),
    "+types",
    Pathe.filename(file) + ".ts"
  );
  const matchesType = t2.tsTypeAliasDeclaration(
    t2.identifier("Matches"),
    null,
    t2.tsUnionType(
      Array.from(routeIds).map((routeId) => {
        const lineage2 = lineages.get(routeId);
        return t2.tsTupleType(
          lineage2.map(
            (route) => t2.tsTypeLiteral([
              t2.tsPropertySignature(
                t2.identifier("id"),
                t2.tsTypeAnnotation(t2.tsLiteralType(t2.stringLiteral(route.id)))
              ),
              t2.tsPropertySignature(
                t2.identifier("module"),
                t2.tsTypeAnnotation(
                  t2.tsTypeQuery(
                    t2.tsImportType(
                      t2.stringLiteral(
                        relativeImportSource(
                          rootDirsPath(ctx, filename2),
                          Path2.resolve(ctx.config.appDirectory, route.file)
                        )
                      )
                    )
                  )
                )
              )
            ])
          )
        );
      })
    )
  );
  const routeImportSource = relativeImportSource(
    rootDirsPath(ctx, filename2),
    Path2.resolve(ctx.config.appDirectory, file)
  );
  const content = ts`
      // Generated by React Router

      import type { GetInfo, GetAnnotations } from "react-router/internal";

      type Module = typeof import("${routeImportSource}")

      type Info = GetInfo<{
        file: "${file}",
        module: Module
      }>
    ` + "\n\n" + generate(matchesType).code + "\n\n" + ts`
      type Annotations = GetAnnotations<Info & { module: Module, matches: Matches }>;

      export namespace Route {
        // links
        export type LinkDescriptors = Annotations["LinkDescriptors"];
        export type LinksFunction = Annotations["LinksFunction"];

        // meta
        export type MetaArgs = Annotations["MetaArgs"];
        export type MetaDescriptors = Annotations["MetaDescriptors"];
        export type MetaFunction = Annotations["MetaFunction"];

        // headers
        export type HeadersArgs = Annotations["HeadersArgs"];
        export type HeadersFunction = Annotations["HeadersFunction"];

        // middleware
        export type MiddlewareFunction = Annotations["MiddlewareFunction"];

        // clientMiddleware
        export type ClientMiddlewareFunction = Annotations["ClientMiddlewareFunction"];

        // loader
        export type LoaderArgs = Annotations["LoaderArgs"];

        // clientLoader
        export type ClientLoaderArgs = Annotations["ClientLoaderArgs"];

        // action
        export type ActionArgs = Annotations["ActionArgs"];

        // clientAction
        export type ClientActionArgs = Annotations["ClientActionArgs"];

        // HydrateFallback
        export type HydrateFallbackProps = Annotations["HydrateFallbackProps"];

        // ServerHydrateFallback
        export type ServerHydrateFallbackProps = Annotations["ServerHydrateFallbackProps"];

        // Component
        export type ComponentProps = Annotations["ComponentProps"];

        // ServerComponent
        export type ServerComponentProps = Annotations["ServerComponentProps"];

        // ErrorBoundary
        export type ErrorBoundaryProps = Annotations["ErrorBoundaryProps"];

        // ServerErrorBoundary
        export type ServerErrorBoundaryProps = Annotations["ServerErrorBoundaryProps"];
      }
    `;
  return { filename: filename2, content };
}
function relativeImportSource(from, to) {
  let path = Path2.relative(Path2.dirname(from), to);
  let extension = Path2.extname(path);
  path = Path2.join(Path2.dirname(path), Pathe.filename(path));
  if (!path.startsWith("../")) path = "./" + path;
  if (!extension || /\.(js|ts)x?$/.test(extension)) {
    extension = ".js";
  }
  return path + extension;
}
function rootDirsPath(ctx, typesPath) {
  const rel = Path2.relative(typesDirectory(ctx), typesPath);
  return Path2.join(ctx.rootDirectory, rel);
}
function paramsType(path) {
  const params = parse2(path);
  return t2.tsTypeLiteral(
    Object.entries(params).map(([param, isRequired]) => {
      const property = t2.tsPropertySignature(
        t2.stringLiteral(param),
        t2.tsTypeAnnotation(t2.tsStringKeyword())
      );
      property.optional = !isRequired;
      return property;
    })
  );
}
function expand(fullpath2) {
  function recurse(segments2, index) {
    if (index === segments2.length) return [""];
    const segment = segments2[index];
    const isOptional = segment.endsWith("?");
    const isDynamic = segment.startsWith(":");
    const required = segment.replace(/\?$/, "");
    const keep = !isOptional || isDynamic;
    const kept = isDynamic ? segment : required;
    const withoutSegment = recurse(segments2, index + 1);
    const withSegment = withoutSegment.map((rest) => [kept, rest].join("/"));
    if (keep) return withSegment;
    return [...withoutSegment, ...withSegment];
  }
  const segments = fullpath2.split("/");
  const expanded = /* @__PURE__ */ new Set();
  for (let result of recurse(segments, 0)) {
    if (result !== "/") result = result.replace(/\/$/, "");
    expanded.add(result);
  }
  return expanded;
}

// typegen/index.ts
var { green, red } = pc;
async function clearRouteModuleAnnotations(ctx) {
  await fs2.rm(
    Path3.join(typesDirectory(ctx), Path3.basename(ctx.config.appDirectory)),
    { recursive: true, force: true }
  );
}
async function write(...files) {
  return Promise.all(
    files.map(async ({ filename: filename2, content }) => {
      await fs2.mkdir(Path3.dirname(filename2), { recursive: true });
      await fs2.writeFile(filename2, content);
    })
  );
}
async function run(rootDirectory, { mode, rsc }) {
  const ctx = await createContext2({ rootDirectory, mode, rsc, watch: false });
  await fs2.rm(typesDirectory(ctx), { recursive: true, force: true });
  await write(
    generateFuture(ctx),
    generateServerBuild(ctx),
    ...generateRoutes(ctx)
  );
}
async function watch(rootDirectory, { mode, logger, rsc }) {
  const ctx = await createContext2({ rootDirectory, mode, rsc, watch: true });
  await fs2.rm(typesDirectory(ctx), { recursive: true, force: true });
  await write(
    generateFuture(ctx),
    generateServerBuild(ctx),
    ...generateRoutes(ctx)
  );
  logger?.info(green("generated types"), { timestamp: true, clear: true });
  ctx.configLoader.onChange(
    async ({ result, configChanged, routeConfigChanged }) => {
      if (!result.ok) {
        logger?.error(red(result.error), { timestamp: true, clear: true });
        return;
      }
      ctx.config = result.value;
      if (configChanged) {
        await write(generateFuture(ctx));
        logger?.info(green("regenerated types"), {
          timestamp: true,
          clear: true
        });
      }
      if (routeConfigChanged) {
        await clearRouteModuleAnnotations(ctx);
        await write(...generateRoutes(ctx));
        logger?.info(green("regenerated types"), {
          timestamp: true,
          clear: true
        });
      }
    }
  );
  return {
    close: async () => await ctx.configLoader.close()
  };
}

export {
  ssrExternals,
  configRouteToBranchRoute,
  createConfigLoader,
  loadConfig,
  resolveEntryFiles,
  resolveRSCEntryFiles,
  parse,
  t,
  traverse,
  generate,
  run,
  watch
};
