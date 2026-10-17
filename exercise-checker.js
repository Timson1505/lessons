(() => {
  const inputClass = "word-answer";

  // Answer keys are attached to exercises in document order. Add more entries here
  // as the remaining lessons' keys are verified.
  const answerKeys = {
  "Beginner-1/lesson-0/index.html": [
    null,
    null,
    null
  ],
  "Beginner-1/lesson-1/index.html": [
    [
      "am",
      "are",
      "am",
      "are",
      "am",
      "is",
      "am",
      "are",
      "is",
      "am"
    ],
    null,
    [
      "I",
      "you",
      "your",
      "my",
      "you",
      "you",
      "you",
      "am",
      "is",
      "you",
      "am"
    ]
  ],
  "Beginner-1/lesson-2/index.html": [
    [
      "a",
      "a",
      "an",
      "a",
      "a",
      "a",
      "an",
      "a"
    ],
    [
      "she",
      "he",
      "he",
      "she",
      "he",
      "she"
    ],
    [
      "her",
      "his",
      "her",
      "his",
      "her",
      "his"
    ],
    [
      "a",
      "a",
      "a",
      "a",
      "a",
      "an",
      "a",
      "an",
      "a",
      "an",
      "a",
      "a"
    ],
    [
      "What is her name",
      "What is her job",
      "What is his job",
      "What is his name",
      "What is her last name",
      "What is her job",
      "What is his name"
    ]
  ],
  "Beginner-1/lesson-3/index.html": [
    [
      "practice",
      "listen",
      "work",
      "match",
      "look",
      "say"
    ],
    null,
    [
      "It is a phone|A phone",
      "It is a picture|A picture",
      "It is a pencil|A pencil",
      "It is a bag|A bag",
      "It is a dictionary|A dictionary",
      "It is a home|A home"
    ],
    null,
    null,
    [
      "one",
      "seven",
      "nineteen",
      "eight",
      "two",
      "fifteen",
      "fourteen",
      "seventeen",
      "eleven",
      "thirteen",
      "sixteen",
      "three"
    ]
  ],
  "Beginner-1/lesson-4/index.html": [
    [
      "Kyrgyzstan",
      "China",
      "Hungary",
      "the USA|USA|United States",
      "Germany",
      "the USA|USA|United States",
      "Kyrgyzstan"
    ]
  ],
  "Beginner-1/lesson-5/index.html": [
    [
      "teachers",
      "doctors",
      "students",
      "children",
      "men",
      "women",
      "babies",
      "people"
    ],
    [
      "am",
      "are",
      "Are",
      "is",
      "are",
      "are",
      "are"
    ]
  ],
  "Beginner-1/Lesson-6/index.html": [
    [
      "Is there",
      "Are there",
      "Are there",
      "Is there",
      "Are there",
      "Is there",
      "Is there"
    ],
    null,
    [
      "There is not an office|There isn't an office",
      "There are not many trees|There aren't many trees",
      "There are not two shops|There aren't two shops",
      "There is not a car|There isn't a car",
      "There are not three rooms|There aren't three rooms"
    ]
  ],
  "Beginner-1/Lesson-7/index.html": [
    [
      "some",
      "any",
      "a",
      "any"
    ]
  ],
  "Beginner-1/lesson-8/index.html": [
    [
      "is",
      "is",
      "is",
      "are",
      "are",
      "are",
      "are",
      "are",
      "are",
      "is",
      "is"
    ]
  ],
  "Beginner-1/lesson-9/index.html": [
    [
      "museums",
      "park",
      "students",
      "hotel",
      "supermarket",
      "airport",
      "bus",
      "stop",
      "red",
      "buses"
    ],
    [
      "Is",
      "are",
      "are",
      "Is",
      "are",
      "is"
    ]
  ],
  "Beginner-2/lesson-1/index.html": [
    [
      "Marta's husband",
      "Katrin's father",
      "Kate's aunt",
      "Bob's sister",
      "Roy's daughter",
      "Virag's parents",
      "siblings"
    ],
    null
  ],
  "Beginner-2/lesson-2/index.html": [
    [
      "have",
      "have",
      "work",
      "speak",
      "use",
      "listen",
      "have",
      "have",
      "do"
    ],
    [
      "Do",
      "have",
      "Do",
      "speak",
      "Do",
      "live",
      "Do",
      "have",
      "Do",
      "have",
      "Do",
      "live",
      "Do",
      "play",
      "Do",
      "do"
    ],
    [
      "don't have",
      "don't play",
      "don't speak",
      "don't do",
      "don't watch",
      "don't study",
      "don't listen",
      "don't live",
      "don't work"
    ]
  ],
  "Beginner-2/lesson-3/index.html": [
    null,
    [
      "I don't",
      "he doesn't",
      "they don't",
      "she doesn't",
      "I don't",
      "I don't",
      "he doesn't",
      "he doesn't",
      "I don't",
      "she doesn't"
    ]
  ],
  "Beginner-2/lesson-4/index.html": [
    [
      "What",
      "Where",
      "When|Why",
      "What",
      "When",
      "Where",
      "How many",
      "What",
      "How many",
      "What"
    ],
    [
      "Do you live",
      "Does",
      "Where",
      "When"
    ],
    [
      "What car do you have",
      "Where do you work",
      "What book do you read",
      "How many friends does your brother have",
      "Where does Tom live",
      "When do you finish work",
      "Who is your favorite teacher",
      "Do you run in the morning",
      "What do you eat for breakfast"
    ],
    [
      "teach",
      "favorite",
      "canteen",
      "cartoons",
      "free time",
      "run",
      "or",
      "groupmate",
      "homework then",
      "walk"
    ]
  ],
  "Beginner-2/lesson-5/index.html": [
    [
      "likes",
      "playing",
      "hates",
      "doing",
      "love",
      "eating",
      "doesn't like",
      "reading",
      "hate",
      "dancing",
      "love",
      "watching",
      "likes",
      "listening",
      "study",
      "",
      "study",
      "",
      "love",
      "riding"
    ],
    [
      "it",
      "me",
      "him",
      "them",
      "us",
      "it",
      "him"
    ],
    null,
    [
      "it",
      "him",
      "them",
      "him",
      "it",
      "her",
      "it",
      "them"
    ]
  ],
  "Beginner-2/lesson-6/index.html": [
    [
      "twenty-five to ten|a quarter to ten",
      "half past twelve",
      "twenty past four",
      "a quarter past eight|quarter past eight",
      "twenty-five to twelve",
      "twenty-five past six",
      "five to four",
      "twenty to two",
      "ten to eleven"
    ],
    null
  ],
  "Beginner-2/lesson-7/index.html": [
    [
      "in",
      "at",
      "in",
      "in",
      "at",
      "at|on",
      "at",
      "on",
      "on"
    ],
    null,
    [
      "at",
      "on|at",
      "every",
      "on",
      "every",
      "at",
      "in",
      "on",
      "in"
    ]
  ],
  "Beginner-2/lesson-8/index.html": [
    [
      "download",
      "piano",
      "guitar",
      "",
      "",
      "instruments",
      "fans",
      "record"
    ],
    [
      "mine",
      "yours",
      "yours",
      "yours",
      "mine",
      "mine",
      "mine",
      "ours"
    ]
  ],
  "Beginner-2/lesson-9/index.html": [
    [
      "very",
      "well",
      "draws",
      "riding a",
      "fly"
    ],
    [
      "can drive",
      "can speak",
      "can read",
      "can draw",
      "can swim",
      "can play",
      "can play",
      "can ride a"
    ],
    [
      "mine",
      "yours",
      "yours",
      "yours",
      "mine",
      "mine",
      "mine",
      "ours"
    ]
  ],
  "Beginner-2/lesson-10/index.html": [
    [
      "trust",
      "discuss",
      "decide",
      "wears",
      "hike",
      "build"
    ],
    [
      "always wear",
      "usually practice",
      "never build",
      "discuss",
      "always trust",
      "usually support",
      "sometimes develop",
      "never create"
    ]
  ],
  "Beginner-2/lesson-11/index.html": [
    [
      "many",
      "much",
      "many",
      "much",
      "much",
      "many",
      "much",
      "much"
    ],
    [
      "How much",
      "How many",
      "How much",
      "How many",
      "How many",
      "How many",
      "How many",
      "How much"
    ]
  ],
  "Beginner-2/lesson-12/index.html": [
    [
      "is adapting",
      "is questioning",
      "am experiencing",
      "are researching",
      "are warning",
      "is investigating",
      "are studying",
      "is preparing",
      "is increasing",
      "am focusing"
    ],
    [
      "am experiencing",
      "is adapting",
      "are multitasking",
      "is questioning",
      "are researching",
      "are investigating",
      "is studying remotely",
      "decreasing"
    ],
    [
      "mine",
      "yours",
      "yours",
      "yours",
      "mine",
      "mine",
      "mine",
      "ours"
    ]
  ],
  "Beginner-3/lesson-1/index.html": [
    [
      "There are",
      "There is",
      "There are",
      "There is",
      "There are",
      "Are there",
      "Is there",
      "Are there"
    ]
  ],
  "Beginner-3/lesson-2/index.html": [
    [
      "was",
      "were",
      "was",
      "were",
      "were",
      "were",
      "was"
    ],
    [
      "wasn't",
      "weren't",
      "wasn't",
      "weren't",
      "weren't",
      "weren't",
      "wasn't"
    ]
  ],
  "Beginner-3/lesson-3/index.html": [
    [
      "studied",
      "worked",
      "moved",
      "rented",
      "visited",
      "solved",
      "rested",
      "watched"
    ],
    [
      "We stayed in a hotel",
      "I didn't use my laptop every day",
      "My mother didn't like cooking",
      "Did he solve his problem",
      "Her brother didn't want to travel",
      "Did people rest on Ysyk-Kol lake",
      "We didn't rent a house"
    ]
  ],
  "Beginner-3/lesson-4/index.html": [
    [
      "went",
      "came",
      "had",
      "did",
      "got",
      "saw",
      "took",
      "made",
      "ate",
      "read"
    ]
  ],
  "Beginner-3/lesson-5/index.html": [
    [
      "What",
      "What",
      "Who",
      "Who",
      "What",
      "What",
      "Where",
      "Which",
      "What",
      "What"
    ],
    [
      "What",
      "Why",
      "Who",
      "Why",
      "Which",
      "Where",
      "Where is"
    ]
  ],
  "Beginner-3/lesson-6/index.html": [
    [
      "two thousand and one|two thousand one",
      "two thousand and eighteen|two thousand eighteen",
      "sixteen thirty-two|one thousand six hundred and thirty-two",
      "fourteen seventy-eight|one thousand four hundred and seventy-eight",
      "thirteen eighty-nine|one thousand three hundred and eighty-nine",
      "nineteen ninety|one thousand nine hundred and ninety",
      "twelve fifty-four|one thousand two hundred and fifty-four",
      "thirteen sixty-five|one thousand three hundred and sixty-five"
    ],
    [
      "Who",
      "Which",
      "Where",
      "who",
      "where",
      "Which",
      "who",
      "where",
      "Who",
      "which"
    ],
    [
      "who",
      "which",
      "who",
      "who|whom",
      "where",
      "which",
      "where"
    ],
    [
      "when",
      "who",
      "where",
      "which",
      "which",
      "which",
      "who",
      "who"
    ]
  ],
  "Beginner-3/lesson-7/index.html": [
    [
      "There was",
      "There weren't",
      "There was",
      "There were",
      "There was",
      "There weren't",
      "There was",
      "There weren't",
      "There was",
      "There were"
    ],
    [
      "Was there",
      "Were there",
      "Was there",
      "Were there",
      "Was there",
      "Was there",
      "Were there"
    ],
    null
  ],
  "Beginner-3/lesson-9/index.html": [
    [
      "so",
      "but|because",
      "because",
      "because",
      "so",
      "but",
      "because",
      "so",
      "but",
      "because"
    ],
    [
      "so",
      "so",
      "but",
      "because",
      "because",
      "so",
      "so",
      "but",
      "so",
      "so"
    ]
  ],
  "Beginner-3/lesson-10/index.html": [
    [
      "want to",
      "want",
      "want to",
      "wants",
      "want to",
      "wants to",
      "want to"
    ],
    [
      "don't want to",
      "wants to",
      "don't",
      "Does",
      "want to",
      "don't want to",
      "Do",
      "want to",
      "wants to",
      "don't want to",
      "Does",
      "want",
      "wants to"
    ],
    [
      "want to",
      "wants",
      "want to",
      "want to",
      "wants",
      "wants to",
      "want",
      "want to",
      "wants",
      "want to"
    ]
  ]
};
  const testAnswerKeys = {
    "Beginner-1/test/index.html": {
      "grammar": [
        "b",
        "b",
        "b",
        "b",
        "b",
        "a",
        "c",
        "a",
        "b",
        "b",
        "b",
        "no correct option (should be are watching)",
        "a",
        "b",
        "a",
        "a",
        "b",
        "c",
        "b",
        "a"
      ],
      "reading": [
        "a",
        "b",
        "b",
        "b",
        "b",
        "b",
        "c",
        "a",
        "b",
        "a"
      ]
    },
    "Beginner-2/test/index.html": {
      "grammar": [
        "b",
        "b",
        "b",
        "b",
        "b",
        "a",
        "c",
        "a",
        "b",
        "b",
        "b",
        "no correct option (should be are watching)",
        "a",
        "b",
        "a",
        "a",
        "b",
        "c",
        "b",
        "a"
      ],
      "reading": [
        "a",
        "b",
        "b",
        "b",
        "b",
        "b",
        "c",
        "a",
        "b",
        "a"
      ]
    },
    "Beginner-3/test/index.html": {
      "grammar": [
        "c",
        "b",
        "b",
        "a",
        "b",
        "a",
        "c",
        "b",
        "b",
        "c",
        "b",
        "a",
        "b",
        "b",
        "a",
        "a",
        "b",
        "b",
        "b",
        "a"
      ],
      "reading": [
        "They went to a small village near a lake",
        "About two thousand people",
        "Near the town center",
        "They rented bikes and visited a museum",
        "A funny guide",
        "Because he was very hungry",
        "They stayed inside the hotel",
        "Handmade souvenirs",
        "It burned down a hundred years ago",
        "Because they enjoyed the village, festival, food and music"
      ]
    }
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


  const testKey = testAnswerKeys[path];
  if (testKey) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "show-answer-key";
    button.textContent = "Show test answer key";
    const display = document.createElement("div");
    display.className = "answer-key-display";
    display.hidden = true;
    const formatList = (title, items) => "<strong>" + title + "</strong><ol>" +
      items.map((answer, i) => "<li>" + (i + 1) + ". " + escapeHtml(answer) + "</li>").join("") + "</ol>";
    button.addEventListener("click", () => {
      display.innerHTML = formatList("Grammar answers", testKey.grammar) +
        formatList("Reading answers", testKey.reading) +
        (path !== "Beginner-3/test/index.html" ? "<p>Question 12 has no correct option as written; the correct sentence is “They are watching TV right now.”</p>" : "");
      display.hidden = false;
    });
    const main = document.querySelector("main") || document.querySelector(".container") || document.body;
    main.appendChild(button);
    main.appendChild(display);
  }

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, char => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    })[char]);
  }
})();