/* Interactive sample lesson for the school landing page. */
(() => {
  const init = () => {
    const options = [...document.querySelectorAll(".school-answer-option")];
    const check = document.getElementById("school-check-answer");
    const feedback = document.getElementById("school-demo-feedback");
    if (!options.length || !check || !feedback) return;
    let selected = "";
    options.forEach(option => option.addEventListener("click", () => {
      selected = option.dataset.answer || "";
      options.forEach(item => item.classList.toggle("selected", item === option));
      feedback.textContent = "Answer selected. Click Check my answer.";
      feedback.className = "school-demo-feedback";
    }));
    check.addEventListener("click", () => {
      if (!selected) {
        feedback.textContent = "Please select one answer first.";
        feedback.className = "school-demo-feedback incorrect";
        return;
      }
      if (selected === "studies") {
        feedback.textContent = "Correct! With he, she or it, add -s or -es: She studies English every evening.";
        feedback.className = "school-demo-feedback correct";
      } else {
        feedback.textContent = "Not quite. With she in the Present Simple, use the third-person form: studies. Try again.";
        feedback.className = "school-demo-feedback incorrect";
      }
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
