(() => {
  const inputClass = "word-answer";

  // Answer keys are attached to exercises in document order. Add more entries here
  // as the remaining lessons' keys are verified.
  const answerKeys = {
    "Beginner-1/lesson-1/index.html": [
      ["am","are","am","are","am","is","am","are","is","am"],
      ["I","you","your","my","I","you","you","am","is","you","am"]
    ],
    "Beginner-1/lesson-2/index.html": [
      ["a","a","an","a","a","a","an","a"],
      ["she","he","he","she","he","she"],
      ["her","his","her","his","her","his"],
      ["a","a","a","a","a","an","a","an","a","an","a","a"]
    ],
    "Beginner-1/Lesson-6/index.html": [
      ["Is there","Are there","Are there","Is there","Are there","Is there","Is there"]
    ],
    "Beginner-1/Lesson-7/index.html": [
      ["are","are","is","are","is","is","are","are"],
      ["some","any","a","any"]
    ],
    "Beginner-1/lesson-3/index.html": [
      ["practice","listen","work","match","look","say"],
      null,
      null,
      null,
      null,
      ["one","seven","nineteen","eight","two","fifteen","fourteen","seventeen","eleven","thirteen","sixteen","three"]
    ],
    "Beginner-1/lesson-5/index.html": [
      ["teachers","doctors","students","children","men","women","babies","people"],
      ["am","are","Are","is","are","are","are"]
    ],
    "Beginner-1/lesson-8/index.html": [
      ["aren't","are","are","is","is","am","are","are","is","is"],
      ["is","is","are","are","are","are","is","is","are","is"]
    ],
    "Beginner-1/lesson-9/index.html": [
      ["museums","park","students","hotel","supermarket","airport","bus stop","red buses"],
      ["on","under","near","near","near"],
      ["on","on","on","on","in","near","on"],
      ["Is","are","are","Is","are","is"]
    ]
  };

  const style = document.createElement("style");
  style.textContent = `
    .word-answer { display:inline-block; width:105px; max-width:32vw; min-height:32px; box-sizing:border-box; margin:2px 4px; padding:4px 7px; border:1px solid #8b9aa5; border-radius:6px; background:#fff; color:#222; font:inherit; font-size:.95em; vertical-align:middle; }
    .word-answer:focus { outline:2px solid #65a9d5; outline-offset:1px; }
    .word-answer.correct { border:2px solid #24834b; background:#effaf2; }
    .word-answer.incorrect { border:2px solid #c43b3b; background:#fff0f0; }
    .check-answers, .show-answer-key { display:inline-block; margin:12px 4px 4px; padding:10px 18px; border:0; border-radius:7px; background:#2878a8; color:#fff; font-size:15px; font-weight:600; cursor:pointer; }
    .show-answer-key { background:#32804b; }
    .check-answers:hover, .show-answer-key:hover { filter:brightness(1.08); }
    .answer-feedback { margin:8px 4px; font-weight:600; }
    .answer-key-display { margin:10px 4px; padding:12px 16px; border-left:4px solid #32804b; border-radius:6px; background:#eef8f0; color:#183d24; }
    .answer-key-display ol { margin:8px 0 0; padding-left:24px; }
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

  const path = decodeURI(location.pathname).replace(/^\/lessons\//, "").replace(/^\//, "");
  const exercises = Array.from(document.querySelectorAll(".ex-1k, .exercise, .question"))
    .filter(container => container.querySelectorAll("input." + inputClass).length > 0);

  exercises.forEach((container, index) => {
    const fields = Array.from(container.querySelectorAll("input." + inputClass));
    const answers = answerKeys[path]?.[index];
    if (answers && answers.length === fields.length) {
      fields.forEach((field, i) => { field.dataset.answer = answers[i]; });
    }

    let feedback = container.querySelector(".answer-feedback");
    if (!feedback) {
      feedback = document.createElement("p");
      feedback.className = "answer-feedback";
      feedback.setAttribute("aria-live", "polite");
      container.appendChild(feedback);
    }

    let checkButton = container.querySelector(".check-answers");
    if (!checkButton) {
      checkButton = document.createElement("button");
      checkButton.type = "button";
      checkButton.className = "check-answers";
      checkButton.textContent = "Check the answer";
      container.appendChild(checkButton);
    }
    checkButton.addEventListener("click", () => {
      const keyed = fields.filter(field => field.dataset.answer);
      let correct = 0;
      fields.forEach(field => {
        const expected = field.dataset.answer;
        if (!expected) {
          field.classList.remove("correct", "incorrect");
          field.removeAttribute("aria-invalid");
          return;
        }
        const accepted = expected.split("|").map(v => v.trim().toLowerCase());
        const ok = accepted.includes(field.value.trim().toLowerCase());
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
        feedback.textContent = "Completed: " + filled + " / " + fields.length + ". The answer key for this exercise is being prepared.";
        feedback.style.color = "#444";
      }
    });

    let revealButton = container.querySelector(".show-answer-key");
    if (!revealButton) {
      revealButton = document.createElement("button");
      revealButton.type = "button";
      revealButton.className = "show-answer-key";
      revealButton.textContent = "Show correct answers";
      container.appendChild(revealButton);
    }
    let display = container.querySelector(".answer-key-display");
    if (!display) {
      display = document.createElement("div");
      display.className = "answer-key-display";
      display.hidden = true;
      display.setAttribute("aria-live", "polite");
      container.appendChild(display);
    }
    revealButton.addEventListener("click", () => {
      const currentAnswers = fields.map(field => field.dataset.answer || "");
      const available = currentAnswers.filter(Boolean).length;
      if (!available) {
        display.innerHTML = "<strong>Answer key is not available for this exercise yet.</strong>";
      } else {
        display.innerHTML = "<strong>Correct answers</strong><ol>" +
          currentAnswers.map((answer, i) => "<li>" + (answer ? escapeHtml(answer.replace(/\|/g, " / ")) : "Answer key pending") + "</li>").join("") +
          "</ol>" + (available < fields.length ? "<p>Some answers are still being reviewed.</p>" : "");
      }
      display.hidden = false;
    });
  });

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, char => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    })[char]);
  }
})();