(() => {
  const inputClass = "word-answer";
  const style = document.createElement("style");
  style.textContent = `
    .word-answer { display:inline-block; width:105px; max-width:32vw; min-height:32px; box-sizing:border-box; margin:2px 4px; padding:4px 7px; border:1px solid #8b9aa5; border-radius:6px; background:#fff; color:#222; font:inherit; font-size:.95em; vertical-align:middle; }
    .word-answer:focus { outline:2px solid #65a9d5; outline-offset:1px; }
    .word-answer.correct { border:2px solid #24834b; background:#effaf2; }
    .word-answer.incorrect { border:2px solid #c43b3b; background:#fff0f0; }
    .check-answers { display:inline-block; margin:12px 4px 4px; padding:10px 18px; border:0; border-radius:7px; background:#2878a8; color:#fff; font-size:15px; font-weight:600; cursor:pointer; }
    .check-answers:hover { filter:brightness(1.08); }
    .answer-feedback { margin:8px 4px; font-weight:600; }
  `;
  document.head.appendChild(style);

  function makeInput() {
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 40;
    input.autocomplete = "off";
    input.className = inputClass;
    input.setAttribute("aria-label", "Type your answer");
    input.placeholder = "Answer";
    input.addEventListener("input", () => {
      input.classList.remove("correct", "incorrect");
      input.removeAttribute("aria-invalid");
    });
    return input;
  }

  // Replace underscore blanks in text nodes without altering HTML attributes or scripts.
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (/_{3,}/.test(node.nodeValue) && !node.parentElement.closest("script,style,textarea,code,pre")) nodes.push(node);
  }
  nodes.forEach(node => {
    const parts = node.nodeValue.split(/(_{3,})/g);
    const fragment = document.createDocumentFragment();
    parts.forEach(part => {
      if (/^_{3,}$/.test(part)) fragment.appendChild(makeInput());
      else if (part) fragment.appendChild(document.createTextNode(part));
    });
    node.parentNode.replaceChild(fragment, node);
  });

  const candidates = Array.from(document.querySelectorAll(".ex-1k, .exercise, .question, li, section"));
  candidates.forEach(container => {
    const inputs = Array.from(container.querySelectorAll("input." + inputClass));
    if (!inputs.length || container.querySelector(".check-answers")) return;
    // Prefer an exercise block; avoid adding buttons to a list item if its exercise block exists.
    if (container.matches("li") && container.closest(".ex-1k, .exercise, .question")) return;
    if (container.matches("section") && container.querySelector(".ex-1k, .exercise, .question")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "check-answers";
    button.textContent = "Check the answer";
    const feedback = document.createElement("p");
    feedback.className = "answer-feedback";
    feedback.setAttribute("aria-live", "polite");
    button.addEventListener("click", () => {
      const fields = Array.from(container.querySelectorAll("input." + inputClass));
      const keyed = fields.filter(field => field.dataset.answer);
      let correct = 0;
      fields.forEach(field => {
        const expected = field.dataset.answer;
        if (!expected) {
          field.classList.remove("correct", "incorrect");
          field.removeAttribute("aria-invalid");
          return;
        }
        const ok = field.value.trim().toLowerCase() === expected.trim().toLowerCase();
        field.classList.toggle("correct", ok);
        field.classList.toggle("incorrect", !ok);
        field.setAttribute("aria-invalid", String(!ok));
        if (ok) correct++;
      });
      const filled = fields.filter(field => field.value.trim()).length;
      if (keyed.length === fields.length) {
        feedback.textContent = "Your score: " + correct + " / " + fields.length;
        feedback.style.color = correct === fields.length ? "#24834b" : "#b52f2f";
      } else {
        feedback.textContent = "Completed: " + filled + " / " + fields.length + ". This exercise has no complete answer key yet, so correctness cannot be fully checked automatically.";
        feedback.style.color = "#444";
      }
    });
    container.appendChild(button);
    container.appendChild(feedback);
  });
})();