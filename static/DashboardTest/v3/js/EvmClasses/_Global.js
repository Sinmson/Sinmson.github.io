  window.EvmClasses = {

    _lastPanelId: 0,
    _timeInterval: "auto",
    _timeStart: new Date(Date.now()).setHours(0,0,0,0),
    _timeEnd: Date.now(),
    _chartOptions: {},
  	_dialogChartOptions: {},
    _containerId: "commonJsContainer",
    _contaienrEl: {},

    set TimepickerRange(newVal) {
      document.querySelector("#timepicker-range").value = newVal;
    },
    get TimepickerRange() {
      return document.querySelector("#timepicker-range");
    },

    set TimeRange(newVal) {
      this.TimepickerRange = newVal;
    },
    get TimeRange() {
      return this.TimepickerRange.value;
    },

    set ContainerId(newVal) {
      this._containerId = newVal;
    },
    get ContainerId() {
      return this._containerId;
    },

    set TimeInterval(newVal) {
      if(!isNaN(parseFloat(newVal)) && isFinite(newVal))
      {
        this._timeInterval = newVal;
      }
    },
    get TimeInterval() {
      return this._timeInterval;
    },

    get ContainerEl() {
      return this._contaienrEl;
    },
    set ContainerEl(newVal) {
      this._contaienrEl = newVal;
    },

    set TimeEnd(newVal) {
      console.log("Set TimeEnd  ", newVal);
      if(!isNaN(parseFloat(newVal)) && isFinite(newVal))
      {
        if(newVal < this.TimeStart)
        {
          this.TimeStart += newVal - this.TimeEnd;
        }

        this._timeEnd = newVal;

        if(document.getElementById("timepicker-end"))
        {
          let flatpickrEl = document.getElementById("timepicker-end")._flatpickr;

          if(flatpickrEl)
          {
            flatpickrEl.setDate(newVal, false);
          }
        }
      }
    },
    get TimeEnd() {
      return this._timeEnd;
    },

    set TimeStart(newVal) {
      console.log("Set TimeStart ", newVal);
      if(!isNaN(parseFloat(newVal)) && isFinite(newVal))
      {
        if(newVal > this.TimeEnd)
        {
          this.TimeEnd +=  newVal - this.TimeStart;
        }

        this._timeStart = newVal;

        if(document.getElementById("timepicker-start"))
        {
          let flatpickrEl = document.getElementById("timepicker-start")._flatpickr;
          if(flatpickrEl)
          {
            flatpickrEl.setDate(newVal, false);
          }
        }
      }
    },
    get TimeStart() {
      return this._timeStart;
    },

    set ChartOptions(newVal) {
      this._chartOptions = newVal;
    },
    get ChartOptions() {
      return this._chartOptions;
    },

  	set DialogChartOptions(newVal) {
        this._dialogChartOptions = newVal;
    },
    get DialogChartOptions() {
      return this._dialogChartOptions;
    },

    get LastPanelId() {
      return this._lastPanelId;
    },
    set LastPanelId(newVal) {
      this._lastPanelId = newVal;
    },

    handleTimeChanged() {
      console.log("handleTimeChanged", this);

      let xMin = Highcharts.charts.map(c => c.xAxis[0].min).reduce((a,b) => (a > b) ? a : b);
      let xMax = Highcharts.charts.map(c => c.xAxis[0].max).reduce((a,b) => (a < b) ? a : b);

      // debugger;

      console.log("xMin     ", new Date(xMin));
      console.log("TimeStart", new Date(window.EvmClasses.TimeStart));
      console.log("xMax     ", new Date(xMax));
      console.log("TimeEnd  ", new Date(window.EvmClasses.TimeEnd));



      if(window.EvmClasses.TimeStart < xMin && (window.EvmClasses.TimeEnd + (1000*60*5)) > xMax)
      {
        console.log("upgradeMetricsInTimeRangeAndNotify");
        window.EvmClasses.Updater.upgradeMetricsInTimeRangeAndNotify();
      }
      else
      {
        if(window.EvmClasses.TimeStart < xMin)
        {
          //Needs to upgrade to the past
          console.log("upgradeMetricsTowardsPastAndNotify");
          window.EvmClasses.Updater.upgradeMetricsTowardsPastAndNotify();
        }

        if(window.EvmClasses.TimeEnd > xMax)
        {
          //Needs to upgrade to the present
          console.log("upgradeMetricsTowardsPresentAndNotify");
          window.EvmClasses.Updater.upgradeMetricsTowardsPresentAndNotify();
        }

        if(window.EvmClasses.TimeEnd < xMax || (window.EvmClasses.TimeStart > xMin && window.EvmClasses.TimeStart < xMax))
        {
          for (var i = 0; i < Highcharts.charts.length; i++)
          {
            Highcharts.charts[i].xAxis[0].setExtremes(window.EvmClasses.TimeStart, window.EvmClasses.TimeEnd);
          }
        }
      }
    },

    chartStartLoading() {
      Highcharts.each(Highcharts.charts, function(chart) {
        chart.showLoading();
      })
    },
    chartHideLoading() {
      Highcharts.each(Highcharts.charts, function(chart) {
        chart.hideLoading();
      })
    },

    isObject(item) {
      return (item && typeof item === 'object' && !Array.isArray(item));
    },

    isNumeric(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    },

    mergeDeep(target, ...sources) {
      if (!sources.length) return target;
      const source = sources.shift();

      if (this.isObject(target) && this.isObject(source)) {
        for (const key in source) {
          if (this.isObject(source[key])) {
            if (!target[key]) Object.assign(target, { [key]: {} });
            this.mergeDeep(target[key], source[key]);
          } else {
            Object.assign(target, { [key]: source[key] });
          }
        }
      }

      return this.mergeDeep(target, ...sources);
    },

    createTimepickersEl() {
      this.ContainerEl.insertAdjacentHTML("beforeend", `
        <div id="timepickers-indicator" class="flexbox row justify-center">
          <span class="chevron" data-is-open="false" title="Show Timepicker"></span>
        </div>
        <div id="timepickers" class="flexbox row wrap justify-center">


          <select id="timepicker-range" class="flexbox item settingsFieldInput timepicker">
            <option value="timepicker" selected>Timepicker</option>
            <option value="3600000">Last hour</option>
            <option value="86400000">Last 24 hours</option>
            <option value="604800000">Last 7 days</option>
          </select>
          <div id="timepicker-start" class=" flexbox row item">
            <input type="text" class="settingsFieldInput timepicker" placeholder="Select Date.."  data-input>
            <span class="flexbox row items-center" style="font-size:14px; margin: 0 5px;">to</span>
          </div>
          <div id="timepicker-end" class=" flexbox row item">
            <input type="text" class="settingsFieldInput timepicker" placeholder="Select Date.." data-input>
          </div>
        </div>
      </div>
      `);

      //console.log("timestart", window.EvmClasses.TimeStart);
      window.EvmClasses.TimeStartFlatpickr = flatpickr("#timepicker-start",
      {
        enableTime: true,
        enableSeconds: false,
        time_24hr: true,
        defaultDate: window.EvmClasses.TimeStart,
        onChange: window.EvmClasses.handle_InputTimepickerStart_Change,
        dateFormat: "d. M Y H:i",
        wrap: true,
        clickOpens: true
      });

      window.EvmClasses.TimeEndFlatpickr = flatpickr("#timepicker-end",
      {
        enableTime: true,
        enableSeconds: false,
        time_24hr: true,
        defaultDate: window.EvmClasses.TimeEnd,
        onChange: window.EvmClasses.handle_InputTimepickerEnd_Change,
        dateFormat: "d. M Y H:i",
        wrap: true,
        clickOpens: true
      });

      document.querySelector("#timepickers-indicator > span.chevron").addEventListener("click", (e) => {
        //console.log(e.target.dataset, e.target.dataset.isOpen, e.target.dataset.isOpen == "false");
        if(e.target.dataset.isOpen == "false")
        {
          //console.log("open timepickers");
          let timepickers = document.getElementById("timepickers");
          if(timepickers)
          {
            timepickers.classList.add("target");
            e.target.dataset.isOpen = true;
            e.target.title = "Hide Timepicker";
          }
        }
        else if(e.target.dataset.isOpen == "true")
        {
          //console.log("close timepickers");
          let timepickers = document.getElementById("timepickers");
          if(timepickers)
          {
            timepickers.classList.remove("target");
            e.target.dataset.isOpen = false;
            e.target.title = "Show Timepicker";
          }
        }
      })

      document.querySelector("#timepicker-range").addEventListener("change", (e) => {
        console.log("timepicker-range", e);
        let range = e.target.value;
        if(range != "timepicker")
        {
          window.EvmClasses.TimeStart = Date.now() - (+range);
          window.EvmClasses.TimeEnd = Date.now();
        }
        window.EvmClasses.handleTimeChanged();
      });
    },

    createDialogEl() {
      window.EvmClasses.ContainerEl.insertAdjacentHTML("beforeend", `
      <div id="dialogContainter">
      <div id="dialog" class="flexbox column">
        <div class="flexbox row dialogHeader wrap">
          <div id="dialogTitleContainer" class="flexbox column item">
            <h3 id="dialogTitle" class="item"></h3>
            <p id="dialogSubTitle" class="item"></p>
          </div>

          <select id="dialog-timepicker-range" class="flexbox item settingsFieldInput timepicker">
            <option value="timepicker" selected>Timepicker</option>
            <option value="3600000">Last hour</option>
            <option value="today">Today</option>
            <option value="86400000">Last 24 hours</option>
            <option value="345600000">Last 4 Days</option>
            <option value="604800000">Last 7 days</option>
            <option value="2592000000">Last 30 days</option>
          </select>
          <select id="dialog-timepicker-interval" class="flexbox item settingsFieldInput timepicker">
            <option value="auto" selected>Auto</option>
            <option value="300000">5 min</option>
            <option value="3600000">Hourly</option>
            <option value="86400000">Daily</option>
          </select>

          <button id="btnCloseDialog" class="btn-close item" title="Close">
            <i class="icon-cancel-circled"></i>
          </button>

        </div>

        <div id="dialogGraphContainer" class="flexbox wrap"></div>
      </div>
      </div>
      `);

      document.querySelector("#dialog-timepicker-range").addEventListener("change", (e) => {
        let range = e.target.value;
        if(range != "timepicker" && range != "today")
        {
          window.EvmClasses.Dialog.TimeStart = Date.now() - (+range);
          window.EvmClasses.Dialog.TimeEnd = Date.now();
        }
        else if (range == "today")
        {
          window.EvmClasses.Dialog.TimeStart = new Date(Date.now()).setHours(0,0,0,0);
          window.EvmClasses.Dialog.TimeEnd = Date.now();
        }
        window.EvmClasses.Dialog.handleTimeChanged();
      });

      document.querySelector("#dialog-timepicker-interval").addEventListener("change", (e) => {
        let interval = e.target.value;
        if(interval != "auto")
        {
          interval = +interval;
        }
        window.EvmClasses.Dialog.TimeInterval = interval;
        window.EvmClasses.Dialog.handleTimeChanged();
        window.EvmClasses.Updater.upgradeMetricsInTimeRangeAndNotify(window.EvmClasses.Dialog.Metrics, true);
      });
    },

    handle_InputTimepickerStart_Change(selectedDates, dateStr, instance)
    {
      let msStart = selectedDates[0];
      msStart = new Date(msStart).getTime();
      if(msStart >= window.EvmClasses.TimeEnd)
      {
        window.EvmClasses.TimeEnd = window.EvmClasses.TimeEnd + msStart - window.EvmClasses.TimeStart;
        document.getElementById("timepicker-end")._flatpickr.setDate( window.EvmClasses.TimeEnd );
      }
      window.EvmClasses.TimeStart = msStart;

      //console.log("newStart", new Date(msStart));
      //console.log("TimeStart", new Date(window.EvmClasses.TimeStart));

      Highcharts.each(Highcharts.charts, function(chart) {
        Highcharts.each(chart.series, function(series) {
          let xData = series.xData;
          //console.log("series", series);
          //console.log("get Old data...");
        });

        chart.redraw();
      })

      window.EvmClasses.handleTimeChanged();
    },

    handle_InputTimepickerEnd_Change(selectedDates, dateStr, instance)
    {
      let msEnd = selectedDates[0];
      msEnd = new Date(msEnd).getTime();

      if(msEnd <= window.EvmClasses.TimeStart)
      {
        let oldDifference = window.EvmClasses.TimeEnd - window.EvmClasses.TimeStart;
        window.EvmClasses.TimeStart = window.EvmClasses.TimeStart + msEnd - window.EvmClasses.TimeEnd;
        document.getElementById("timepicker-start")._flatpickr.setDate( window.EvmClasses.TimeStart );
      }
      window.EvmClasses.TimeEnd = msEnd;

      window.EvmClasses.handleTimeChanged();
    },
    loadSvg(selector, url, callbackFunc)
    {
      var target = document.querySelector(selector);
      // If SVG is supported
      if (typeof SVGRect != "undefined") {
        // Request the SVG file
        var ajax = new XMLHttpRequest();
        ajax.open("GET", url + ".svg", true);
        ajax.send();

        // Append the SVG to the target
        ajax.onload = (e) => {
          target.innerHTML = ajax.responseText;
          callbackFunc();
        }
      }
    }
  };
