# Dynamic Navigation — SPFx React Web Part (Starter)

This archive contains a ready-to-build SPFx React web part project skeleton for the **Dynamic Navigation** web part we discussed.


## What this archive is


- A complete SPFx project skeleton (config + source files) configured for SPFx v1.16+ React. It does **not** include node_modules.
You must run the build commands locally to produce the `.sppkg` package.

## Prerequisites (on your machine)

1. Node.js 18 LTS installed.
2. npm (comes with Node) or pnpm/yarn if you prefer.
3. Yeoman & SPFx generator (optional if you want to regenerate):
   ```bash
   npm install -g yo @microsoft/generator-sharepoint
   ```

## How to build the .sppkg (exact commands)

1. Open a terminal in the project root (where package.json is).

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build and bundle for production (ship):
   ```bash
   gulp bundle --ship
   ```

4. Package solution:
   ```bash
   gulp package-solution --ship
   ```

5. After step 4, find the .sppkg file in `sharepoint/solution/` directory. Upload that file to your App Catalog and deploy.

## Notes & recommended changes

- If your tenant requires specific CDN hosts or additional permissions, adjust `write-manifests.json` and the `config/package-solution.json` accordingly.
- Replace placeholder GUIDs (in config) with your own if required.
- The project uses PnPjs and Fluent UI. If your environment blocks external scripts, use SPFx-provided utilities or bundle icons.

## If you want me to produce the actual .sppkg for you

- I cannot run the Node toolchain or build the package in this environment. I prepared everything so you can run the 4 commands above locally and produce the package.

-- End of README
