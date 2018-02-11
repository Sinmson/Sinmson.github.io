"use strict"

console.log("SC_Dialog.js");

window.EvmClasses.Dialog = {
  _vars: {
    title: "",
    subTitle: "",
    charts: [],
    metrics: [],
    dialogCharts: [],
    timeStart: window.EvmClasses.TimeStart,
    timeEnd: window.EvmClasses.TimeEnd,
    timeInterval: window.EvmClasses.TimeInterval
  },

  get Updater() { return window.EvmClasses.Updater; },
  get Title() { return this._vars.title; },
  get SubTitle() { return this._vars.subTitle; },
  get Charts() { return this._vars.charts; },
  get DialogCharts() { return this._vars.dialogCharts; },
  get Metrics() { return this._vars.metrics; },
  get TimeStart() { return this._vars.timeStart; },
  get TimeEnd() { return this._vars.timeEnd; },
  get TimeInterval() { return this.TimepickerInterval.value; },
  get TimeRage() { return this.TimepickerRange.value; },
  get TimepickerRange() { return document.querySelector("#dialog-timepicker-range"); },
  get TimepickerInterval() { return document.querySelector("#dialog-timepicker-interval"); },

  set Title(newVal) {  this._vars.title = newVal; this.drawTitle(); },
  set SubTitle(newVal) {  this._vars.subTitle = newVal; this.drawTitle(); },
  set Charts(newVal) {  this._vars.charts = newVal; },
  set DialogCharts(newVal) {  this._vars.dialogCharts = newVal; },
  set Metrics(newVal) {  this._vars.metrics = newVal; },
  set TimeStart(newVal) { this._vars.timeStart = newVal; },
  set TimeEnd(newVal) { this._vars.timeEnd = newVal; },
  set TimeInterval(newVal) { this.TimepickerInterval = newVal; console.log("set Dialog.TimeInterval", newVal); },
  set TimepickerRange(newVal) { document.querySelector("#dialog-timepicker-range").value = newVal },
  set TimepickerInterval(newVal) { document.querySelector("#dialog-timepicker-interval").value = newVal },


  load(config)
  {
    this.Title = config.title;
    this.SubTitle = config.subTitle;
    this.Charts = config.charts;
    //console.log("load dialog", config);
    // console.log("Dialog._vars", JSON.parse(JSON.stringify(this._vars)), this._vars, window.EvmClasses.TimeInterval);
    // console.log("Dialog.TimeInterval", this.TimeInterval);
    return this;
  },

  draw()
  {
    this.TimepickerInterval = "auto";
    // console.log("Dialog._vars", JSON.parse(JSON.stringify(this._vars)), this._vars);
    let dialog = document.getElementById("dialog");
    dialog = document.getElementById("dialog");
    if(dialog)
    {
      document.getElementById("btnCloseDialog").addEventListener("click", (e) => this.handle_BtnCloseDialog_Click(e, this));
    }

    this.OpenDialog();
    this.drawTitle();
    this.drawSubTitle();
    setTimeout(() => {
      this.createDialogCharts();
    }, 200);

    return this;
  },

  drawTitle()
  {
    //console.log("drawTitle", document.querySelector("#dialogTitle"));
    if(document.querySelector("#dialogTitle"))
    {
      document.querySelector("#dialogTitle").innerText = this.Title;
    }
  },

  drawSubTitle()
  {
    //console.log("TODO:", "Implement drawSubTitle");
    //TODO: Implement
    if(document.querySelector("#dialogSubTitle"))
    {
      document.querySelector("#dialogSubTitle").innerHTML = this.SubTitle;
    }
  },

  OpenDialog()
  {
    console.log("#dialogContainter", document.getElementById("dialogContainter"));
    document.getElementById("dialogContainter").classList.add("target");
    document.getElementById("dialog").classList.add("target");
  },

  handle_BtnCloseDialog_Click(e, that)
  {
    document.getElementById("dialog").classList.remove("target");
    window,EvmClasses.chartHideLoading();
    setTimeout( () => {
      document.getElementById("dialogContainter").classList.remove("target");
      for (var i = 0; i < that.DialogCharts.length; i++)
      {
        that.DialogCharts[i].destroy(true);
      }
      that.DialogCharts = [];
      let newLines = document.querySelectorAll("#dialogGraphContainer > .newline");
      for(let i = 0; newLines && i < newLines.length; i++)
      {
        let newline = newLines[i];
        document.querySelector("#dialogGraphContainer").removeChild(newline);
      }
      window.EvmClasses.ChartTemplate.removeUndefinedCharts();
      window.EvmClasses.Dialog.TimeStart = window.EvmClasses.TimeStart;
      window.EvmClasses.Dialog.TimeEnd = window.EvmClasses.TimeEnd;
      window.EvmClasses.Dialog.TimepickerRange = "timepicker";
      // window.EvmClasses.Updater.upgradeMetricsInTimeRangeAndNotify();
    }, 100);
  },

  handleTimeChanged()
  {
    console.log("dialog handleTimeChanged", this);
    let metricsTimes = window.EvmClasses.Updater.getMetricsTimes(this.Metrics);
    console.log("upgradeMetricsInTimeRangeAndNotify");
    window.EvmClasses.Updater.upgradeMetricsInTimeRangeAndNotify(this.Metrics, true);
  },

  createDialogCharts()
  {
    let metrics = [];
    //console.log("Dialog", this);
    for (var i = 0; i < this.Charts.length; i++)
    {
      let chartDialogConfig = this.Charts[i];
      let chartOptions = chartDialogConfig.chartOptions;

      let dialogChart = new window.EvmClasses.DialogChart(chartDialogConfig);
      dialogChart.draw();
      let dialogMetrics = dialogChart.Metrics;
      dialogMetrics.map( m => metrics.push(m));
      this.DialogCharts.push(dialogChart);
      // dialogChart.drawChart();
      //console.log("dialogChart", dialogChart, metrics);
    }
    this.Metrics = metrics;
    window.EvmClasses.Updater.upgradeMetricsInTimeRangeAndNotify(metrics, true);

    return this;
  },

  seriesToMetric(series)
  {
    let metric = {
      name: series.name,
      id: series.metricId,
      type: series.type,
      aggType: series.metricAggType
    };

    return metric;
  }
}
