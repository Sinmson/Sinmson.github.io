console.log("C_Panel.js");


window.EvmClasses.Panel = class extends window.EvmClasses.Board {
  constructor(args) {
    if(!args) args = {};
    super(args);
    this._onclick         = ("clickable"      in args)  ? args.clickable      : false;
    this._dialog          = ("dialog"         in args)  ? args.dialog         : false;
    this._link            = ("link"           in args)  ? args.link           : false;
    this._config          = ("config"         in args)  ? args.config         : { series: [ {} ] };
    this._smIds           = ("smIds"          in args)  ? args.smIds          : []; //Servicemodel Ids
    this._hardStatusAgg   = ("hardStatusAgg"  in args)  ? args.hardStatusAgg  : "worst";
    this._showStatus      = ("showStatus"     in args)  ? args.showStatus     : (this._smIds.length > 0 ? true : false);
    this._top             = ("top" in args)           ?   args.top         : 125;
    this._left            = ("left" in args)          ?   args.left        : 50;
    this._width           = ("width" in args)         ?   args.width       : 300;
    this._height          = ("height" in args)        ?   args.height      : 200;
    //console.log("Panel.this", this);

    if(this.draw)
    {
      this.draw();
    }
    this.subscribeToUpdater();
  }


  set OnClick(newVal)       { this._onclick       = newVal; }
  set SmIds(newVal)         { this._smIds         = newVal; }
  set HardStatusAgg(newVal) {this._hardStatusAgg  = newVal; }
  set ShowStatus(newVal)    {this._showStatus     = newVal; }
  set Top(newVal)       { this._top       = newVal; }
  set Left(newVal)      { this._left      = newVal; }
  set Width(newVal)     { this._width     = newVal; }
  set Height(newVal)    { this._height    = newVal; }



  get Status()        { return this._status; }
  get OnClick()       { return this._onclick; }
  get Dialog()        { return this._dialog; }
  get Link()          { return this._link; }
  get Config()        { return this._config; }
  get Id()            { return this._id; }
  get SmIds()         { return this._smIds; }
  get HardStatusAgg() { return this._hardStatusAgg; }
  get HardStatus()    { return this.getHardStatus(); }
  get ShowStatus()    { return this._showStatus; }
  get Top()           { return window.EvmClasses.isNumeric(this._top)     ? this._top     + "px" : this._top;   }
  get Left()          { return window.EvmClasses.isNumeric(this._left)    ? this._left    + "px" : this._left;  }
  get Width()         { return window.EvmClasses.isNumeric(this._width)   ? this._width   + "px" : this._width; }
  get Height()        { return window.EvmClasses.isNumeric(this._height)  ? this._height  + "px" : this._height;}

  subscribeToUpdater()
  {
    this.Updater.subscribe(this);
  }

  openDialog(e, thisPanel)
  {
    //console.log("Open Dialog", thisPanel);
    if(thisPanel.Dialog)
    {
      if(window.EvmClasses.isObject(thisPanel.Dialog))
      {
        //console.log("open Dialog", window.EvmClasses);
        let dialog = window.EvmClasses.Dialog.load(thisPanel.Dialog);
        dialog.draw();
      }
      else
      {
        //console.log("Open link in new Tab");
        var win = window.open(thisPanel.Dialog, '_blank');
        win.focus();
      }
    }
  }

  callbackUpdate(message)
  {
    if(this.Debug)
    {
      //console.log("callbackUpdate", message);
      //console.log(this.Updater);
    }
    switch (message) {
      case "Updated SmIds":
        this.redrawSmId();
        break;
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


  isDrawn()
  {
    return this.El != undefined && this.El != null && this.ElContainer != undefined && this.ElContainer != null;
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
            status = "⛔";
            break;
          case "Warning":
            status = "⚠";
            break;
          case "Normal":
            status = "✓";
            break;
        }
        str +=  status + "\t" + smId.id + "\n";
      }

      return str;
    }
  }

  drawContainer()
  {
    super.drawContainer();
  }

  redrawSmId()
  {
    this.drawSmId();
  }

  drawThis()
  {
    super.drawThis();

    if(this.AbsolutePositioning)
    {
      //console.log("drawThis panel", this.Width, this.Height, this.Top, this.Left);
      this.El.style.width   = this.Width;
      this.El.style.height  = this.Height;
      this.El.style.top     = this.Top;
      this.El.style.left    = this.Left;
      this.El.classList.add("panel");
    }

    this.drawSmId();
  }

  redrawThis()
  {
    if(this.El)
    {
      if(this.AbsolutePositioning)
      {
        this.El.style.width   = this.Width;
        this.El.style.height  = this.Height;
        this.El.style.top     = this.Top;
        this.El.style.left    = this.Left;
      }

      this.redrawSmId();
    }
    else
    {
      this.draw();
    }
  }

  drawSmId()
  {
    if(this.El)
    {
      if(this.ElStatus && this.ShowStatus)
      {
        if (this.ElStatus.classList.contains("Grey"))     { this.ElStatus.classList.remove("Grey"); }
        if (this.ElStatus.classList.contains("Normal"))   { this.ElStatus.classList.remove("Normal"); }
        if (this.ElStatus.classList.contains("Warning"))  { this.ElStatus.classList.remove("Warning"); }
        if (this.ElStatus.classList.contains("Critical")) { this.ElStatus.classList.remove("Critical"); }

        if(this.HardStatus)
        {
          this.ElStatus.classList.add(this.HardStatus);
        }

        if(this.ShowStatus)
        {
          this.ElStatus.classList.add("status");
        }
        else
        {
          this.ElStatus.classList.remove("status");
        }


        this.ElStatus.dataset.tooltip = this.getDataTooltipString();
      }
    }
    else
    {
      this.draw();
    }
  }

  draw()
  {
    super.draw();
    this.redrawSmId();
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
}
