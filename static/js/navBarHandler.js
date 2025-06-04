export function setupBottomSheetEvents() {
  const floatingBtn = document.querySelector(".plus-circle");
  const addSheet = document.querySelector(".add-todo-sheet");
  const cancelBtn = document.querySelector(".add-todo-sheet .cancel-btn");

  if (!floatingBtn || !addSheet || !cancelBtn) return;

  floatingBtn.addEventListener("click", () => {
    addSheet.classList.remove("hidden");
    setTimeout(() => addSheet.classList.add("active"), 10);
  });

  cancelBtn.addEventListener("click", () => {
    addSheet.classList.remove("active");
    setTimeout(() => addSheet.classList.add("hidden"), 300);
  });
}

export function openBottomSheet() {
  document.querySelector(".bottom-sheet")?.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

export function closeBottomSheet() {
  document.querySelector(".bottom-sheet")?.classList.add("hidden");
  document.body.classList.remove("modal-open");
}