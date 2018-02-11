"use strict"

console.log("C_ChartTemplate.js");


window.EvmClasses.ChartTemplate = class extends window.EvmClasses.Metrics
{
  constructor(args)
  {
    super(args);
    this._chartObj = false;
    this._config = {};
    this._config = window.EvmClasses.mergeDeep(this._config, this.DefaultChartOptions);
    this._config = window.EvmClasses.mergeDeep(this._config, window.EvmClasses.ChartOptions);

    if("config" in args)
    {
      // //console.log("Config was set...I hope you know what you are doing.", args);
      this._config = window.EvmClasses.mergeDeep(this._config, args.config);
    }
    else if("chartOptions" in args)
    {
      this._config = window.EvmClasses.mergeDeep(this._config, args.chartOptions);
    }
    this.drawChart();
    // this.setChartOptionsEvents();
    // //console.log("Chart constructor -> ChartOptions" , this._config);
  }

  get Config()      { return this._config;        }
  get ChartObj()    { return this._chartObj;      }
  get DefaultChartOptions()  {
    let series = [];
    let plotOptions = {
      column: {
        stacking: 'normal',
        dataGrouping: {
          groupPixelWidth: 10
        },
        connectNulls: false,
        pointPadding: 0,
        borderWidth: 1,
        groupPadding: 0
      },
      area: {
        stacking: 'normal',
        dataGrouping: {
          groupPixelWidth: 10
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
          connectNulls: false
        },
        connectNulls: false,
        states: {
          hover: {
            enabled: false
          }
        }
      }
    };

    let chartOptions =
    {
      credits: {
        enabled: false
      },
      plotOptions,
      exporting: {
        enabled: false
      },
      series: series,
      title: { text:  ""},
      yAxis: {
        title: {
          text: ""
        },
        visible: true
      },
      xAxis: {
        visible: false,
        ordinal: false,
        startOnTick: false,
        endOnTick: false,
        crosshair: {
          snap: false
        },
        events: {
          setExtremes: window.EvmClasses.Chart.syncExtremes,
          afterSetExtremes: window.EvmClasses.Chart.afterSetExtremes
        }
      },
      legend: {
        enabled: false
      },
      scrollbar: {
        enabled: false
      },
      tooltip: {
        shared: true,
        split: false,
        enabled: false
      },
      chart: {
        zoomType: "x",
        margin: [5, 0, 0, 0],
        resetZoomButton: {
          position: {
            x: -80,
            y: 0
          },
          theme: {
              display: 'none'
          }
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

  set ChartObj(newVal) {this._chartObj = newVal; if(this.Debug) { console.log("ChartObj = " + newVal);}}
  set Config(newVal) {this._config = newVal; if(this.Debug) { console.log("Config = " + newVal);}}


  draw()
  {
    super.draw();
  }

  drawChart()
  {
    let series = this.convertDatasetsToSeries();
    //console.log("drawChart series", series);
    let config = {};
    EvmClasses.mergeDeep(config, this.Config);
    config.series = series;

    if(config && config.xAxis && config.xAxis[0])
    {
      config.xAxis = config.xAxis[0];
    }

    this.addGraph(config);

    this.ElContainer.addEventListener("mousemove", window.EvmClasses.ChartTemplate.syncCrosshair, false);
    this.ElContainer.addEventListener("touchmove", window.EvmClasses.ChartTemplate.syncCrosshair, false);
    this.ElContainer.addEventListener("touchstart", window.EvmClasses.ChartTemplate.syncCrosshair, false);

    this.ElContainer.addEventListener("mouseleave", window.EvmClasses.ChartTemplate.syncCrosshairHide, false);
  }



  static zoomAtStartEnd(chart, isDialog)
  {
    if(chart && chart.series && chart.series.length > 0)
    {
      //console.log("setExtremes", window.EvmClasses.TimeStart, window.EvmClasses.TimeEnd);
      //console.log("zoomAtStartEnd", new Date(window.EvmClasses.TimeStart), new Date(window.EvmClasses.TimeEnd));
      let start = isDialog ? window.EvmClasses.Dialog.TimeStart : window.EvmClasses.TimeStart;
      let end = isDialog ? window.EvmClasses.Dialog.TimeEnd : window.EvmClasses.TimeEnd;
      chart.xAxis[0].setExtremes(start, end, true, true, { trigger: 'zoomAtStartEnd' });
      chart.xAxis[0].zoom(start,end);
      // chart.showResetZoom();
    }
  }

  static syncExtremes(e)
  {
    // console.log("syncExtremes");
    // console.log("min", new Date(e.min), e.min);
    // console.log("max", new Date(e.max), e.max);
    // console.trace("trigger", e.trigger);
    // var thisChart = this.chart;
    //
    // if (e.trigger === 'zoom')
    // {
    //   let timeStart = e.min || e.target.chart.xAxis["0"].dataMin;
    //   let timeEnd = e.max || e.target.chart.xAxis["0"].dataMax;
    //
    //   if(Math.round(timeStart) != Math.round(window.EvmClasses.TimeStart))
    //   {
    //     window.EvmClasses.TimeStart = timeStart;
    //   }
    //   if(Math.round(timeEnd) != Math.round(window.EvmClasses.TimeEnd))
    //   {
    //     window.EvmClasses.TimeEnd = timeEnd;
    //   }
    //
    //   window.EvmClasses.handleTimeChanged();
    // }
  }


  static afterSetExtremes(e)
  {
    console.log("afterSetExtremes");
    console.log("min", new Date(e.min), e.min);
    console.log("max", new Date(e.max), e.max);
    console.trace("trigger", e.trigger);

    let chart = this.chart;
    let legend = chart.legend;

    if(legend && legend.allItems)
    {
      console.log("legend items", legend.allItems);
      for (let i = 0; i < legend.allItems.length; i++)
      {
        let item    = legend.allItems[i];
        let newText = window.EvmClasses.ChartTemplate.getLegendFormat(item);


        item.legendItem.attr({ text: newText })
      }
    }
    if(e.trigger == "zoom")
    {
      let timeStart = e.min || e.target.chart.xAxis["0"].dataMin;
      let timeEnd = e.max || e.target.chart.xAxis["0"].dataMax;

      if(Math.round(timeStart) != Math.round(window.EvmClasses.TimeStart))
      {
        window.EvmClasses.TimeStart = timeStart;
      }
      if(Math.round(timeEnd) != Math.round(window.EvmClasses.TimeEnd))
      {
        window.EvmClasses.TimeEnd = timeEnd;
      }

      window.EvmClasses.TimeRange = "timepicker";

      window.EvmClasses.handleTimeChanged();
    }
  }

  redrawChart()
  {
    let that = this;

    if(!this.ChartObj)
    {
      this.drawChart();
    }
    else
    {
      Highcharts.each(this.ChartObj.series, function(seriesNow) {
        let data = that.convertDatasetToData(seriesNow.userOptions.metricId);
        seriesNow.setData(data);
      });

      this.ChartObj.hideLoading();
    }
  }

  updateView()
  {
    super.updateView();

    this.redrawChart();
  }

  addGraph(chartOptions)
  {
    //console.log("addGraph super", JSON.parse(JSON.stringify( chartOptions)));
  }

  static removeUndefinedCharts()
  {
    for(let i = 0; i < Highcharts.charts.length; i++)
    {
      let chart = Highcharts.charts[i];
      console.log("i", i, chart);
      if(chart == undefined || chart == null || Object.keys(chart) < 5)
      {
        Highcharts.charts.splice(i, 1);
        i--;
      }
    };
  }

  destroy(isDialog)
  {
    // console.log("destroy", this);

    window.EvmClasses.Updater.removeObserver(this.Id, isDialog);
    this.ChartObj.destroy();
    Highcharts.charts.splice(Highcharts.charts.indexOf(this.ChartObj), 1);

    this.El.parentElement.removeChild(this.El);
    //console.log("destroyed", this, this.ChartObj, window.EvmClasses.Updater.observers);
  }

  static getLegendFormat(series)
  {
    var total = 0;
    let values    = series.processedYData || series.yData;
    values = values.filter( v => v != null);

    //console.log("getLegendFormat series data", series.processedYData, series.yData);
    // console.log("getLegendFormat values", values);
    let valueSum  = (values.length > 0) ? values.reduce((previous, current) => current += previous) : 0;
    let valueMin  = Math.min.apply(null, values);
    let valueMax  = Math.max.apply(null, values);
    let valueAvg  = (valueSum / values.length );
    let valueAvgRounded = Math.round(valueAvg);
    let valueSumRounded = Math.round(valueSum);
    let valueMinRounded = Math.round(valueMin);
    let valueMaxRounded = Math.round(valueMax);

    let metricString = "Seriesname error...";
    // //console.log(series);
    // //console.log(series.chart.userOptions.series);

    let userOptions = series.userOptions;
    // .series.find( s => s.name == series.name && s.color == series.color);

    if(userOptions)
    {
      metricString = userOptions.legendString;
    }
    // console.log("getLegendFormat", userOptions);

    metricString = metricString.replace("#{sum}", valueSumRounded);
    metricString = metricString.replace("#{min}", valueMinRounded);
    metricString = metricString.replace("#{max}", valueMaxRounded);
    metricString = metricString.replace("#{avg}", valueAvgRounded);


    return metricString;
  }

  static getApproximation(valueArray)
  {
    // //console.log("valueArray", valueArray);
    let aggType = this.userOptions.metricAggType;

    if(valueArray && Array.isArray(valueArray) && valueArray.length > 0)
    {
      let sum = valueArray.reduce((a,b) => { return a + b; });
      let min = valueArray.reduce((a,b) => { return (a < b) ? a : b; });
      let max = valueArray.reduce((a,b) => { return (a > b) ? a : b; });
      let avg = (sum / valueArray.length);
      let avgRound2DigitsBehind = Math.round(avg,2);

      if(aggType.toUpperCase() == "SUM")
        return sum;
      if(aggType.toUpperCase() == "MIN")
        return min;
      if(aggType.toUpperCase() == "MAX")
        return max;
      if(aggType.toUpperCase() == "AVG")
        return avgRound2DigitsBehind;
    }
    return null;
  }

  static handle_ChartContainer_Mousemove_Touchstart_Touchmove (e)
  {
    console.log("handle_ChartContainer_Mousemove_Touchstart_Touchmove", e, event, this);
    let hoveredChart = this.series ? this.series.chart : e.target.series.chart;
    event = hoveredChart.pointer.normalize(event); // Find coordinates within the chart

    // let width = hoveredChart.chartWidth;
    // let height = hoveredChart.chartHeight;
    // let xPercent =  chartX / width;
    // let yPercent =  chartY / height;

    for (var i = 0; i < Highcharts.charts.length; i++)
    {
      let chart = Highcharts.charts[i];

      if(chart != hoveredChart)
      {
        chart.xAxis[0].drawCrosshair(event);
      }
    }
  }

  labelFormatter()
  {
    //console.log("labelFormatter", window.EvmClasses.ChartTemplate.getLegendFormat(this));
    return window.EvmClasses.ChartTemplate.getLegendFormat(this);
  }



  static syncCrosshair(e)
  {
    let hoveredChart = window.EvmClasses.ChartTemplate.getHighchartsFromEl(e.target);

    if(!hoveredChart)
    {
      return;
    }

    let hEvent = hoveredChart.pointer.normalize(event);
    let pLeft = hEvent.chartX / hoveredChart.chartWidth;
    let hPoint = hoveredChart.series[0].searchPoint(hEvent, true);
    let hTimestamp = false;
    if(hPoint)
    {
      hTimestamp = hPoint.x;
    }

    for (var i = 0; i < Highcharts.charts.length; i++)
    {
      let chart = Highcharts.charts[i];
      let pointsToShow = [];
      let xPos = chart.chartWidth * pLeft;
      if(hTimestamp)
      {

        let series = chart.series;
        if(chart && chart.userOptions && chart.userOptions.legend && chart.userOptions.tooltip.enabled && chart.userOptions.legend.enabled)
        {
          Highcharts.each(series, function(s)
          {
            let dataToLoop = s.groupedData ? s.groupedData : s.data;
            let points = s.getValidPoints();
            let point = points.find(p => p.x == hTimestamp);
            if(point)
            {
              pointsToShow.push(point);
            }
          });
        }
        if(series.length > 0 && pointsToShow.length > 0)
        {
          chart.tooltip.refresh(pointsToShow);
          //console.log("set xPos", series.length, pointsToShow.length);
          xPos = pointsToShow[0].clientX + 10;
        }
      }
      //console.log("xPos", xPos);
      chart.xAxis[0].drawCrosshair({chartX: xPos, chartY: 5});

    }
  }

  static syncCrosshairHide(e)
  {
    Highcharts.each(Highcharts.charts, function(chart)
    {
      chart.tooltip.hide();
    });
  }

  static getHighchartsFromEl(el)
  {
    let foundElement = false;
    let loopingEl = el;
    do
    {
      if(loopingEl.classList.contains("chartContainer"))
      {
        foundElement = loopingEl;
      }
      else
      {
        loopingEl = loopingEl.parentNode;
        if(loopingEl == document.body)
        {
          foundElement = null;
        }
      }
    }while(foundElement === false)

    if(foundElement)
    {
      return Highcharts.charts[foundElement.dataset.highchartsChart];
    }

    return foundElement;
  }

}
