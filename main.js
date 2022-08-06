function indent(ind) {
  let json = "";
  let i = ind;
  while(i > 0) {
    json += "  ";
    i--;
  }
  return json;
}

function blocksToJSON(blocks, ind) {
  let json = "";
  for (var i = 0; i < blocks.length; i++) {
    let child = blocks[i];
    json += indent(ind);
    json += "{\n";
    json += indent(ind+1);
    const classes = {
      moveto: () => {
        json += "\"action\": \"moveto\",\n";
        json += indent(ind+1);
        const select = child.querySelector("select");
        const target = select.options[select.selectedIndex].value;
        json += "\"target\": \""+target+"\"";
      },
      pick: () => {
        json += "\"action\": \"pick\"";
      },
      drop: () => {
        json += "\"action\": \"drop\"";
      },
      cook: () => {
        json += "\"action\": \"cook\"";
      },
      if: () => {
        json += "\"action\": \"if\",\n";
        const input = child.querySelector(".cond");
        const cond = input.value;
        json += indent(ind+1);
        json += "\"cond\": \""+cond+"\",\n";
        json += indent(ind+1);
        json += "\"actions\": [\n";
        json += blocksToJSON(child.querySelector("ul").children, ind+2);
        json += indent(ind+1);
        json += "]";
      },
      while: () => {
        json += "\"action\": \"while\",\n";
        const input = child.querySelector(".cond");
        const cond = input.value;
        json += indent(ind+1);
        json += "\"cond\": \""+cond+"\",\n";
        json += indent(ind+1);
        json += "\"actions\": [\n";
        json += blocksToJSON(child.querySelector("ul").children, ind+2);
        json += indent(ind+1);
        json += "]";
      },
    };
    classes[child.dataset.type]();
    json += "\n";
    json += indent(ind);
    if(i+1 == blocks.length) {
      json += "}\n";
    } else {
      json += "},\n";
    }
  }
  return json;
}

function updateJSON() {
  let code = document.getElementById("code");
  while (code.hasChildNodes()) {
    code.removeChild(code.firstChild);
  }

  let blocks = document.getElementById("blocks");
  let json = '{\n  "actions": [\n';
  json += blocksToJSON(blocks.children, 2);
  json += "  ]\n}";

  code.innerHTML = json;

  hljs.initHighlighting.called = false;
  hljs.highlightAll();
}

function addList(list) {
  new Sortable(list, {
    group: "shared",
    animation: 150,
    multiDrag: true,
    selectedClass: "selected",
    fallbackTolerance: 3,
    onAdd: function (evt) {
      if(evt.item.classList.contains("if") || evt.item.classList.contains("while")) {
        addList(evt.item.querySelector("ul"));
        evt.item.querySelector("input").addEventListener('keypress', function() {
          updateJSON();
        });
      }
      if(evt.item.classList.contains("moveto")) {
        evt.item.querySelector("select").addEventListener('change', function() {
          updateJSON();
        });
      }
      evt.item.querySelector(".delete").addEventListener('click', function(e) {
        e.target.parentNode.remove();
        updateJSON();
      });
    },
    onChange: function (evt) {
      updateJSON();
    },
  });
}

window.addEventListener("load", function (event) {
  updateJSON();
  addList(document.getElementById("blocks"));
  new Sortable(document.getElementById("library"), {
    group: {
      name: "shared",
      pull: "clone",
      put: "false",
    },
    sort: false,
    animation: 150,
  });

  hljs.highlightAll();
});
