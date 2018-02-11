console.log("C_Picture.js");



window.EvmClasses.Picture = class extends window.EvmClasses.Panel {
  constructor(args) {
    if(!args) args = {};
    super(args);
    this._path = (args.path) ? args.path : false;
    this._separator = (args.separator) ? args.separator : "";
  }

  set Path(newVal)      { this._path      = newVal; if(this.Debug) { console.log("path = "      + newVal); }}
  set Separator(newVal) { this._separator = newVal; if(this.Debug) { console.log("separator = " + newVal); }}

  get Path()      { return this._path;      }
  get Separator() { return this._separator; }


  draw()
  {
    super.draw();
    this.El.classList.add("picture");

    this.ElContainer.classList.add("status");

  }

  callbackUpdate(message)
  {
    super.callbackUpdate(message);

    switch (message)
    {
      case "Updated SmIds":
        this.redrawPicture();
        break;
      default:

    }
  }

  updateView()
  {
    super.updateView();
    this.redrawPicture();
  }

  redrawSmId()
  {
    super.redrawSmId();

    if(this.El && this.ElStatus)
    {
      if (this.ElContainer.classList.contains("Grey"))     { this.ElContainer.classList.remove("Grey"); }
      if (this.ElContainer.classList.contains("Normal"))   { this.ElContainer.classList.remove("Normal"); }
      if (this.ElContainer.classList.contains("Warning"))  { this.ElContainer.classList.remove("Warning"); }
      if (this.ElContainer.classList.contains("Critical")) { this.ElContainer.classList.remove("Critical"); }
      this.ElContainer.classList.add(this.HardStatus);
      this.ElContainer.dataset.tooltip = this.getDataTooltipString();
    }
  }

  redrawPicture()
  {
    let path = this.Path;
    if(path)
    {
      let pathExtention = path.split('.').pop();
      let pathWithoutEnd = path.substr(0 , path.length - pathExtention.length - 1);
      let realPath =  pathWithoutEnd + this.Separator + this.HardStatus + "." + pathExtention;
      this.ElContainer.style.backgroundImage = "url( ' " + realPath + "' )";
    }
  }

}
