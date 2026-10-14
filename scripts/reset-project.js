#!/usr/bin/env node

/**
 * This script is used to reset the project to a blank state.
 * It deletes or moves the /src and /scripts directories to /example based on user input and creates an MVC scaffold with thin Expo Router routes.
 * You can remove the `reset-project` script from package.json and safely delete this file after running it.
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const root = process.cwd();
const oldDirs = ["src", "scripts"];
const exampleDir = "example";
const newRouteDir = "src/route";
const newSourceDirs = [
  newRouteDir,
  "src/models",
  "src/controllers",
  "src/config",
  "src/views/screens",
  "src/views/components",
  "src/views/hooks",
  "src/views/styles",
];
const exampleDirPath = path.join(root, exampleDir);

const indexContent = `export { default } from "@/views/screens/home-screen";
`;

const homeScreenContent = `import { Text, View, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Edit src/views/screens/home-screen.tsx to edit this screen.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
`;

const layoutContent = `import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack />;
}
`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const moveDirectories = async (userInput) => {
  try {
    if (userInput === "y") {
      // Create the example directory
      await fs.promises.mkdir(exampleDirPath, { recursive: true });
      console.log(`📁 /${exampleDir} directory created.`);
    }

    // Move old directories to the example directory or delete them
    for (const dir of oldDirs) {
      const oldDirPath = path.join(root, dir);
      if (fs.existsSync(oldDirPath)) {
        if (userInput === "y") {
          const newDirPath = path.join(root, exampleDir, dir);
          await fs.promises.rename(oldDirPath, newDirPath);
          console.log(`➡️ /${dir} moved to /${exampleDir}/${dir}.`);
        } else {
          await fs.promises.rm(oldDirPath, { recursive: true, force: true });
          console.log(`❌ /${dir} deleted.`);
        }
      } else {
        console.log(`➡️ /${dir} does not exist, skipping.`);
      }
    }

    // Create the MVC directories and Expo Router entry point
    for (const dir of newSourceDirs) {
      await fs.promises.mkdir(path.join(root, dir), { recursive: true });
    }
    const newRouteDirPath = path.join(root, newRouteDir);
    console.log("\n📁 New MVC directories created in /src.");

    // Keep the screen implementation outside the route directory
    const homeScreenPath = path.join(root, "src/views/screens/home-screen.tsx");
    await fs.promises.writeFile(homeScreenPath, homeScreenContent);
    console.log("📄 src/views/screens/home-screen.tsx created.");

    // Create index.tsx
    const indexPath = path.join(newRouteDirPath, "index.tsx");
    await fs.promises.writeFile(indexPath, indexContent);
    console.log("📄 src/route/index.tsx created.");

    // Create _layout.tsx
    const layoutPath = path.join(newRouteDirPath, "_layout.tsx");
    await fs.promises.writeFile(layoutPath, layoutContent);
    console.log("📄 src/route/_layout.tsx created.");

    console.log("\n✅ Project reset complete. Next steps:");
    console.log(
      `1. Run \`npx expo start\` to start a development server.\n2. Edit src/views/screens/home-screen.tsx to edit the main screen.\n3. Put data and business rules in /src/models, state and actions in /src/controllers, and UI in /src/views. Keep /src/route for routes and layouts.${
        userInput === "y"
          ? `\n4. Delete the /${exampleDir} directory when you're done referencing it.`
          : ""
      }`
    );
  } catch (error) {
    console.error(`❌ Error during script execution: ${error.message}`);
  }
};

rl.question(
  "Do you want to move existing files to /example instead of deleting them? (Y/n): ",
  (answer) => {
    const userInput = answer.trim().toLowerCase() || "y";
    if (userInput === "y" || userInput === "n") {
      moveDirectories(userInput).finally(() => rl.close());
    } else {
      console.log("❌ Invalid input. Please enter 'Y' or 'N'.");
      rl.close();
    }
  }
);
