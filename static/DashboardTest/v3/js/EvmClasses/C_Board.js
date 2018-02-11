

window.EvmClasses.Board = class Board {
  constructor(args) {
    if(!args) args = {};
    this._parentEl        = ("parentEl" in args)      ?   args.parentEl    : window.EvmClasses.ContainerEl;
    this._id              = window.EvmClasses.LastPanelId++;
    this._debug           = ("debug" in args)         ? args.debug         : false;
    this._absolutePositioning = true;
    this._draw            = true;

    this.setArgValuesBeforeEverythingElse(args);
  }

  get Id()            { return this._id; }
  get El()            { return document.getElementById(this.Id);}
  get ElContainer()   { return document.getElementById(this.Id + "_Container"); }
  get ElStatus()      { return document.getElementById(this.Id + "_Status"); }
  get Debug()         { return this._debug;}
  get Updater()       { return window.EvmClasses.Updater; }
  get ParentEl()      { return this._parentEl; }
  get AbsolutePositioning() { return this._absolutePositioning; }


  set AbsolutePositioning(newVal) { this._absolutePositioning = newVal; }
  set ParentEl(newVal) { this._parentEl = newVal; }

  setArgValuesBeforeEverythingElse()
  {
    return this;
  }

  draw()
  {
    this.drawThis();
    this.drawContainer();
  }

  drawThis()
  {
    if(!this.El)
    {
      let divPanel = document.createElement("div");
      divPanel.id = this.Id;
      divPanel.classList.add("board");
      console.log("window.EvmClasses", window.EvmClasses);
      this.ParentEl.appendChild(divPanel);
      // this.redrawThis();
    }
  }

  drawContainer()
  {
    let status = document.createElement("div");
    status.id = this.Id + "_Status";

    let container = document.createElement("div");
    container.id = this.Id + "_Container";
    container.className = "container";

    if(this.El)
    {
      this.El.appendChild(status);
      this.El.appendChild(container);
    }
    else
    {
      this.drawThis();
      this.drawContainer();
    }
  }
}
