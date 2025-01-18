import { init, addFloatingBlocksChangeListener, getCurrentFloatingBlocks } from "@flows/js";

init({
  environment: "production",
  organizationId: "orgId",
  userId: "testUserId",
});

const updateCurrentBlocks = () => {
  const p =
    document.querySelector(".current-blocks") ??
    (() => {
      const p = document.createElement("p");
      p.className = "current-blocks";
      document.body.appendChild(p);
      return p;
    })();

  p.textContent = JSON.stringify(getCurrentFloatingBlocks());
};

addFloatingBlocksChangeListener((blocks) => {
  const p = document.createElement("p");
  p.textContent = `Floating blocks changed ${blocks.length}`;
  document.body.appendChild(p);

  updateCurrentBlocks();
});
