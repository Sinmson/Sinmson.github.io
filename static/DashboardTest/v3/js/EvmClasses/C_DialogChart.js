"use strict"

console.log("C_Dialog.js");


window.EvmClasses.DialogChart = class extends window.EvmClasses.ChartTemplate
{
  constructor(args)
  {
    if(!args) args = {};
    super(args);
  }

  drawChart()
  {
    super.drawChart();

    if(this.ChartObj)
    {
      window.EvmClasses.Chart.zoomAtStartEnd(this.ChartObj);
      this.ChartObj.hideLoading();
    }
  }

  get LinebreakAfterwards() { return this._vars.linebreakAfterwards; };
  get DefaultChartOptions()  {
    let series = [];
    let plotOptions = {
      column: {
        stacking: 'normal',
        dataGrouping: {
          groupPixelWidth: 5
        },
        connectNulls: false,
        pointPadding: 0,
        borderWidth: 1,
        groupPadding: 0,
        pointRange: 1
      },
      area: {
        stacking: 'normal',
        dataGrouping: {
          groupPixelWidth: 5
        },
        connectNulls: false
      },
      line: {
        dataGrouping: {
          groupPixelWidth: 3
        },
        connectNulls: false
      },
      series: {
        dataGrouping: {
          approximation: window.EvmClasses.Chart.getApproximation,
          units: [[
            'minute',
              [5]
            ], [
            'hour',
              [1]
            ], [
            'day',
              [1]
            ], [
            'week',
              [1]
            ], [
            'month',
              [1]
            ], [
              'year',
            null
          ]]
        },
        states: {
          hover: {
            enabled: false
          }
        },
        events: {
          legendItemClick: function(event) {
            let retVal = true;
            console.log("---start", this);
            let metricId = event.target.userOptions.metricId;
            window.EvmClasses.DialogChart.xhrRequestSynchron(
              {
                method: "GET",
                url: "/centauri/MainServlet/templates/stylesheets/custom/XMLCalls/dynamic/SMIDandMetricNames.json",
                data:
                {
                  metricids : metricId
                },
                callbackSuccess: (datArrStr) => {
                  let datArr = JSON.parse(datArrStr);
                  console.log("----start", datArr);
                  if(datArr.length > 0)
                  {
                    let sm_id = datArr[0].SMID;
                    let urlProd = "/group/telekom/deep-dive?SM_ID=" + sm_id + "&SM_Depth=7";
                    let urlDev = "/group/telekom/deepdive?SM_ID=" + sm_id + "&SM_Depth=7";

                    let url = (window.origin.indexOf("tmv1102") >= 0) ? urlDev : urlProd;

                    var win = window.open( urlDev, '_blank');
                    console.log("win", win);
                    win.focus();
                    retVal = false;
                  }
                  else
                  {
                    retVal = true;
                  }
                    console.log("----end");
                },
                callbackError: (errMessage) => {
                  console.error(errMessage);
                  retVal = true;
                }
              }
            );

            console.log("---end", retVal);
            return retVal;
          }
        },
        connectNulls: false
      }
    };

    let chartOptions =
    {
      credits: {
        enabled: false
      },
      plotOptions,
      exporting: {
        enabled: true
      },
      series: series,
      title: { text:  ""},
      yAxis: {
        title: {
          text: ""
        },
        visible: true,
        opposite: true
      },
      xAxis: {
        visible: true,
        ordinal: false,
        startOnTick: false,
        endOnTick: false,
        crosshair: {
          snap: false
        },
        events: {
          setExtremes: window.EvmClasses.DialogChart.syncDialogExtremes,
          afterSetExtremes: window.EvmClasses.DialogChart.afterDialogSetExtremes
        }
      },
      legend: {
        enabled: true,
        labelFormatter: this.labelFormatter,
        useHTML: true
      },
      scrollbar: {
        enabled: false
      },
      tooltip: {
        shared: true,
        split: false,
        enabled: true,
        valueDecimals: 2
      },
      chart: {
        zoomType: "x",
        resetZoomButton: {
          position: {
            x: -80,
            y: 0
          }
          // theme: {
          //     display: 'none'
          // }
        }
      },
      rangeSelector : {
        enabled: false
      },
      navigator: {
        enabled: false
      }
    };

    return chartOptions;
  }
  set LinebreakAfterwards(newVal) { this._vars.linebreakAfterwards = newVal; };
  get IsDialog( ) { return true; }
  // labelFormatter()
  // {
  //   let labelFormat = super.labelFormatter();
  //   return "<span>" + labelFormat + " </span><a href='#'>[DD]</a>"
  // }

  static xhrRequestSynchron(args)  {
      let str = "";
      for (let key of Object.keys(args.data)) {
        if (str != "") {
            str += "&";
        }
        str += key + "=" + args.data[key];
      }
      let xhr = new XMLHttpRequest();
      xhr.open(args.method || "GET", (args.method.toUpperCase() != "GET".toUpperCase()) ? args.url : args.url+ "?" + str , false, args.user || null, args.password || null);
      if (args.headers) {
          Object.keys(args.headers).forEach(key => {
              xhr.setRequestHeader(key, args.headers[key]);
          });
      }
      xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            args.callbackSuccess(xhr.response);
          } else {
            args.callbackError(xhr.statusText);
          }
      };
      xhr.onerror = () => reject(xhr.statusText);
      xhr.send(args.body || args.data || null);
  }

  callbackUpdate(message)
  {
    super.callbackUpdate(message);

    switch (message) {
      case "Updated Times":
        window.EvmClasses.Chart.zoomAtStartEnd(this.ChartObj);
        break;
      case "Updated Metrics":
        this.redrawChart();
        break;
      case "Updated DialogMetrics":
        if(window.EvmClasses.Dialog.TimeRange !== "timepicker")
        {
          window.EvmClasses.Dialog.TimeEnd = Date.now();
        }
        // this.updateMetrics(true);
        this.redrawChart();
        break;
    }
  }

  subscribeToUpdater()
  {
    if(this.Metrics)
    {
      this.Updater.subscribe(this, true);
    }
  }

  //Gets called in super constructor
  setArgValuesBeforeEverythingElse(args)
  {
    this.AbsolutePositioning = false;
    this.ParentEl = document.querySelector("#dialogGraphContainer");
	  let chartOptions = {};
    chartOptions = window.EvmClasses.mergeDeep(chartOptions, window.EvmClasses.DialogChartOptions, args.chartOptions);

    let width = args.width;
    let height = args.height;


    args.config = chartOptions;

    args.metrics = this.seriesToMetrics(chartOptions.series);

    if(!this._vars) this._vars = {};
    this._vars.linebreakAfterwards = ("linebreakAfterwards" in args) ? args.linebreakAfterwards : false;
  }

  seriesToMetrics(series)
  {
    let metrics = [];
    if(Array.isArray(series))
    {
      for (var i = 0; i < series.length; i++)
      {
        let seriesNow = series[i];

        let metric = {
          name: seriesNow.name,
          id: seriesNow.metricId,
          type: seriesNow.type,
          aggType: seriesNow.metricAggType,
          color: seriesNow.color,
          legendString: seriesNow.legendString,
        };
        metrics.push(metric);
      }
    }

    return metrics;
  }

  draw()
  {
    super.draw();
  }

  redrawChart()
  {
    super.redrawChart();

    if(this.ChartObj)
    {
      // let legend = this.ChartObj.legend;
      // if(legend && legend.allItems)
      // {
      //   for (let i = 0; i < legend.allItems.length; i++)
      //   {
      //     let item    = legend.allItems[i];
      //     let newText = window.EvmClasses.DialogChart.getLegendFormat(item);
      //
      //     // newText = "<span>" + newText + " </span><a href='#'>[DD]</a>";
      //
      //     item.legendItem.attr({ text: newText });
      //   }
      // }

      window.EvmClasses.ChartTemplate.zoomAtStartEnd(this.ChartObj, true);
    }

  }




  registerChartContainer()
  {
    let chartContainer = document.createElement("div");
    chartContainer.classList.add("item");
    chartContainer.classList.add("chartContainer");
    chartContainer.classList.add("target");
    chartContainer.style.height = "100%";
    chartContainer.style.width = "100%";
    chartContainer.id = "chartContainer_" + this.Id;

    this.El.classList.add("graph");
    this.El.classList.add("item");
    this.El.classList.add("flexbox");
    this.El.classList.add("column");
    this.El.classList.add("shadow-1");

    //minus 2x margin
    this.El.style.width = "calc(" + this.Width + " - 25px)";
    this.El.style.height = "calc(" + this.Height + " - 25px)";

    this.ElContainer.classList.add("fullSize");
    this.ElContainer.appendChild(chartContainer);

    if(this.LinebreakAfterwards)
    {
      this.addLinebreakEl(this.El);
    }

    return chartContainer;
  }

  static syncDialogExtremes(e)
  {
    var thisChart = this.chart;

    let timeStart = e.min || e.target.chart.xAxis["0"].dataMin;
    let timeEnd = e.max || e.target.chart.xAxis["0"].dataMax;

    if(Math.round(timeStart) != Math.round(window.EvmClasses.Dialog.TimeStart))
    {
      window.EvmClasses.Dialog.TimeStart = timeStart;
    }
    if(Math.round(timeEnd) != Math.round(window.EvmClasses.Dialog.TimeEnd))
    {
      window.EvmClasses.Dialog.TimeEnd = timeEnd;
    }

    if (e.trigger === 'zoom')
    {
      window.EvmClasses.ChartTemplate.removeUndefinedCharts();
      let chartsToLoop = window.EvmClasses.Dialog.DialogCharts.map(dc => dc.ChartObj);
      Highcharts.each(chartsToLoop, function (chart)
      {
        if (chart && chart !== thisChart && chart)
        {
          //console.log("syncExtremes", chart);
          if (chart.xAxis[0].setExtremes) // null while updating
          {
            chart.xAxis[0].setExtremes(window.EvmClasses.Dialog.TimeStart, window.EvmClasses.Dialog.TimeEnd, true, false, { trigger: 'syncExtremes' });
            chart.xAxis[0].zoom(window.EvmClasses.Dialog.TimeStart,window.EvmClasses.Dialog.TimeEnd);
          }
        }
      });
      
      window.EvmClasses.Dialog.TimepickerRange = "timepicker";
    }
  }

  static afterDialogSetExtremes(e)
  {
    let chart = this.chart;
    let legend = chart.legend;

    if(legend && legend.allItems)
    {
      for (let i = 0; i < legend.allItems.length; i++)
      {
        let item    = legend.allItems[i];
        let newText = window.EvmClasses.ChartTemplate.getLegendFormat(item);

        item.legendItem.attr({ text: newText })
      }
    }
  }

  addGraph(chartOptions)
  {
    super.addGraph(chartOptions);

    let chartContainerEl = this.El.querySelector("chartContainer_" + this.Id);
    if(!chartContainerEl)
    {
      chartContainerEl = this.registerChartContainer();
    }

    //console.log("DialogChart addGraph", chartOptions, chartContainerEl);

    let chart = new Highcharts.stockChart(chartContainerEl, chartOptions, (chartObj) => {
      this.ChartObj = chartObj;

      this.ChartObj.setSize(null, null, false);
      window.EvmClasses.ChartTemplate.zoomAtStartEnd(chartObj);
    });

    return chart;
  }

  addLinebreakEl(afterThisEl)
  {
    let lnDiv = document.createElement("div");
    lnDiv.classList.add("newline");
    if(afterThisEl)
    {
      // console.log("afterThisEl", afterThisEl);
      afterThisEl.parentNode.insertBefore(lnDiv, afterThisEl.nextSibling);
    }
    else
    {
      document.getElementById(window.EvmClasses.ContainerId).appendChild(lnDiv);
    }
  }


}
