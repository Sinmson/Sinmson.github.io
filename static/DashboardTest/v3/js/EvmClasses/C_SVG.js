console.log("C_SVG.js");



window.EvmClasses.SVG = class {
  constructor(args) {
    if(!args) args = {};
    this._vars = {
	  id: ("elId" in args) ? args.elId : "",
      elId: ("elId" in args) ? args.elId : "",
      dialog: ("dialog" in args) ? args.dialog : "",
      smIds: ("smIds" in args) ? args.smIds : [],
      hardStatusAgg: ("hardStatusAgg" in args) ? args.hardStatusAgg : "WORST"
    }
    if(this.El)
    {
      this.initSVG();
    }

    this.Updater.subscribe(this);
  }

  get ElId() { return this._vars.elId; }
  get Id() { return this._vars.id; }
  get SmIds() { return this._vars.smIds; }
  get Dialog() { return this._vars.dialog; }
  get El() { return document.getElementById(this.ElId); }
  get Updater() { return window.EvmClasses.Updater; }
  get HardStatusAgg() { return this._vars.hardStatusAgg; }
  get HardStatus()    { return this.getHardStatus(); }

  set SmIds(newVal) { this._vars.smIds = newVal; }
  set HardStatusAgg(newVal) {this._hardStatusAgg  = newVal; }


  callbackUpdate(message)
  {
    switch (message)
    {
      case "Updated SmIds":
        this.redrawSmId();
        break;
      default:

    }
  }

  getHardStatus()
  {
    //console.log("HardStatusAgg", this.HardStatusAgg, this._hardStatusAgg);
    if(this.HardStatusAgg)
    {
      switch (this.HardStatusAgg.toUpperCase())
      {
        case "WORST":
          return this.getHardStatusWorstCase();
        case "AVG":
          return this.getHardStatusAvgCase();
        case "BEST":
          return this.getHardStatusBestCase();
        default:
          return this.getHardStatusWorstCase();
      }
    }
    else
    {
      this.HardStatusAgg = "WORST";
      this.getHardStatus();
    }
  }

  getStatusOfSmId(smId)
  {
    if(this.SmIds)
    {
      if(this.Updater.smIdsData[smId])
        return this.Updater.smIdsData[smId].currentQualityLabel;
    }

    return "Grey";
  }

  getHardStatusAvgCase()
  {
    let smIdsData = [];
    for (let smId of this.SmIds)
    {
      smIdsData.push( this.Updater.smIdsData[smId] || "Grey" );
    }
    let codes = { "Grey": -1, "Normal": 0, "Warning": 1, "Critical": 2 };
    let describtions = ["Normal", "Warning", "Critical"];
    let sum = 0;
    for (let dat of smIdsData)
    {
      sum += codes[dat.currentQualityLabel];
    }

    sum /= smIdsData.length;

    return describtions[Math.round(sum)];
  }

  getHardStatusBestCase()
  {
    let smIdsData = [];
    for (let smId of this.SmIds)
    {
      smIdsData.push( this.Updater.smIdsData[smId] || "Grey" );
    }

    let codes = { "Grey": -1, "Normal": 0, "Warning": 1, "Critical": 2 };
    let status = "Grey";
    for (let dat of smIdsData)
    {
      if(codes[dat.currentQualityLabel] < codes[status] && dat.currentQualityLabel != "Grey")
      {
        status = dat.currentQualityLabel;
      }
    }

    return status;

  }

  getHardStatusWorstCase()
  {
    let smIdsData = [];
    if(this.SmIds)
    {
      for (let smId of this.SmIds)
      {
        smIdsData.push( this.Updater.smIdsData[smId] || "Grey" );
      }
    }


    let codes = { "Grey": -1, "Normal": 0, "Warning": 1, "Critical": 2 };
    let status = "Grey";
    for (let dat of smIdsData)
    {
      if(codes[dat.currentQualityLabel] > codes[status] && dat.currentQualityLabel != "Grey")
      {
        status = dat.currentQualityLabel;
      }
    }


    return status;
  }

  getDataTooltipString()
  {
    if(this.SmIds)
    {
      let str = "";

      let sortedSmIds = [];
      let codes = { "Grey": -1, "Normal": 0, "Warning": 1, "Critical": 2 };
      for (let smId of this.SmIds)
      {
        let status = "Grey";
        status = this.getStatusOfSmId(smId);
        sortedSmIds.push( {
          id: smId,
          status: status,
          code: codes[status]
        })
      }

      sortedSmIds = sortedSmIds.sort( (a , b ) => {
        return b.code - a.code;
      })

      for (let smId of sortedSmIds)
      {
        let symbol = "-";
        switch (smId.status)
        {
          case "Critical":
            status = "Err: ";
            break;
          case "Warning":
            status = "Warn:";
            break;
          case "Normal":
            status = "Ok:  ";
            break;
        }
        str +=  status + "\t" + smId.id + "\n";
      }

      return str;
    }
  }

  initSVG()
  {
    this.El.classList.add("svg-el");
    let dragFlag = 0;
    let ignoreNextMove = false;
    this.El.addEventListener("mouseup", (e) => {
      if(dragFlag == 0)
      {
        this.openDialog(e, this)
      }
    });
    this.El.addEventListener("mousedown", (e) => {
      dragFlag = 0;
      ignoreNextMove = true;
    });
    this.El.addEventListener("mousemove", (e) => {
      if(!ignoreNextMove)
      {
        dragFlag = 1;
      }
      else
      {
        ignoreNextMove = false;
      }
    });
  }

  openDialog(e, thisSVG)
  {
    if(thisSVG.Dialog)
    {
      if(window.EvmClasses.isObject(thisSVG.Dialog))
      {
        let dialog = window.EvmClasses.Dialog.load(thisSVG.Dialog);
        dialog.draw();
      }
      else
      {
        var win = window.open(thisSVG.Dialog, '_blank');
        win.focus();
      }
    }
  }

  redrawSmId()
  {
    if(this.El)
    {
      if (this.El.classList.contains("Grey"))     { this.El.classList.remove("Grey"); }
      if (this.El.classList.contains("Normal"))   { this.El.classList.remove("Normal"); }
      if (this.El.classList.contains("Warning"))  { this.El.classList.remove("Warning"); }
      if (this.El.classList.contains("Critical")) { this.El.classList.remove("Critical"); }
      this.El.removeAttribute("style");
      this.El.classList.add(this.HardStatus);
      this.El.dataset.tooltip = this.getDataTooltipString();
      let tooltip = document.createElementNS("http://www.w3.org/2000/svg","title")
      // title.textContent = text
      tooltip.innerHTML = this.El.dataset.tooltip;
      while (this.El.firstChild) {
        this.El.removeChild(this.El.firstChild);
      }
      this.El.appendChild(tooltip);
    }
  }


}
