console.log("C_Metrics.js");

window.EvmClasses.Metrics = class extends window.EvmClasses.Panel {
  constructor(args) {
    if(!args) args = { };
    super(args);
    this._metrics     =   ("metrics" in args)       ? args.metrics   : [];

    this.subscribeToUpdater();
  }


  get Metrics()           { return this._metrics || [];       }
  get TimeStart()         { return window.EvmClasses.TimeStart;    }
  get TimeEnd()           { return window.EvmClasses.TimeEnd;    }
  get TimeInterval()      { return window.EvmClasses.TimeInterval;    }
  get ConvertedDatasets() { return this.convertDatasetsToCsv(this.Datasets); }
  get Datasets()          { return this.getDatasets()    }


  set Metrics(newVal)
  {
    this._metrics      = newVal;
    console.log("metrics = "       + newVal);
  }
  // set Datasets(newVal)      {this._datasets     = newVal; if(this.Debug) { console.log("datasets = "      + newVal);}}


  callbackUpdate(message)
  {
    super.callbackUpdate(message);

    console.log("callbackUpdate", message);
    switch (message) {
      case "Updated Metrics":
        if(!this.IsDialog)
        {
          this.updateMetrics();
        }
        break;
      case "Updated DialogMetrics":
        this.updateMetrics(true);
        break;
    }
  }

  updateMetrics(isDialog)
  {
    let externMetrics = this.getMetricsFromUpdater(isDialog);
    console.log("updateMetrics isDialog", isDialog, externMetrics);
    // console.log("externMetrics", externMetrics);
    for (let metric of this.Metrics)
    {
      let metricWithData = externMetrics.find( m => m.id == metric.id);

      if(metricWithData)
      {
        metric.data = metricWithData.data;
      }
    }
  }

  static areSameTimeMetrics(m1,m2)
  {
    if(m1.id == m2.id)
    {
      return true;
    }

    return false;
  }

  getMetricsFromUpdater(isDialog)
  {
    let metrics = [];
    let metricsToSearch = isDialog ? this.Updater.dialogMetrics : this.Updater.metrics;
    // console.log("isDialog", isDialog);
    // console.log("metricsToSearch", metricsToSearch);
    for(let metric of JSON.parse(JSON.stringify(this.Metrics)))
    {
      // console.log("metric", metric);
      let foundMetric = metricsToSearch.find( m => window.EvmClasses.Metrics.areSameTimeMetrics(m,metric));
      // console.log("foundMetric 1", foundMetric);
      if(foundMetric)
      {
        foundMetric = JSON.parse(JSON.stringify(foundMetric));
        // console.log("foundMetric 2", foundMetric);
        if(foundMetric)
        {
          if(!foundMetric.data) foundMetric.data = [];
          metrics.push(foundMetric);
        }
      }
    }

    // metrics = metrics.sort( (m1,m2) => m1.START < m2.START);

    return metrics;
  }

  getFullfilledData(metric)
  {
    let start = this.TimeStart;
    let end = this.TimeEnd;
    let nanStart = {
      AVG_VALUE: null,
      MAX_VALUE: null,
      SUM_VALUE: null,
      MIN_VALUE: null,
      METRICID:  null,
      START:    start,
      STARTTIME:"00:00",
      placeholderFlag: true
    };

    let nanEnd = {
      AVG_VALUE: null,
      MAX_VALUE: null,
      SUM_VALUE: null,
      MIN_VALUE: null,
      METRICID:  null,
      START:    end,
      STARTTIME:"00:00",
      placeholderFlag: true
    };

    if(metric.data.length < 1)
    {
      metric.data.unshift(nanStart);
      metric.data.push(nanEnd);
    }
    else if(metric.data.length > 0)
    {
      while(metric.data.findIndex(d => d.placeholderFlag == 1) >= 0)
      {
        metric.data.splice(metric.data.findIndex(d => d.placeholderFlag == 1), 1);
      }

      if(metric.data[0] == null)
      {
        metric.data.splice(metric.data.indexOf(null), 1);
      }
      // console.log("metric 2", JSON.parse(JSON.stringify(metric)));
      if(metric.data[0].START > start && metric.data[0].SUM_VALUE != null)
      {
        metric.data.unshift(nanStart);
      }
      if(metric.data[metric.data.length-1].START < end && metric.data[metric.data.length-1].SUM_VALUE != null)
      {
        metric.data.push(nanEnd);
      }
    }

    return metric;
  }

  getDatasets()
  {
    let metricsData = [];
    for (let metric of JSON.parse(JSON.stringify(this.Metrics)))
    {
      let foundMetric = this.Updater.metrics.find( m => {
        return m.id == +metric.id;
      });
      if(foundMetric)
      {
        if("data" in foundMetric)
        {

          metricsData.push( foundMetric.data );
        }
      }
      else
      {
        console.error("No Metric found", metric, " in " , this.Updater.metrics);
      }
    }

    return metricsData;
  }

  subscribeToUpdater()
  {
    if(this.Metrics)
    {
      this.Updater.subscribe(this);
    }
  }

  convertMetricsToCsv()
  {
    let datasets = JSON.parse(JSON.stringify(this.Metrics)).map( m => m.data);
    let csv = this.convertDatasetsToCsv(datasets);

    return csv;
  }

  convertDatasetsToSeries()
  {
    let metrics = JSON.parse(JSON.stringify(this.Metrics));
    let times = [];

    let series = []; //series besteht aus type, name und data
    //console.log(this);
    for (let metric of metrics)
    {
      let seriesNow = {
        name: metric.name || "",
        type: metric.type || "line",
        color: metric.color || "#333333",
        legendString: metric.legendString || "Summe von " + metric.name + " #{sum}",
        metricId: metric.id,
        metricAggType: metric.aggType || "SUM",
        data: []
      };

      // console.log("Not ireable", metric);
      seriesNow.data = this.convertDatasetToData(seriesNow.metricId);

      series.push(seriesNow);
    }

    return series;
  }

  convertDatasetToData(metricId)
  {
    let metrics = JSON.parse(JSON.stringify(this.Metrics));
    let metric = metrics.find( m => m.id == metricId);
    let data = [];
    // console.log("convertDatasetToData", this, metricId);
    if(metric && metric.data)
    {
      // console.log("data before fullfillment", JSON.parse(JSON.stringify(metric.data)));
      metric = this.getFullfilledData(metric);
      // console.log("data after fullfillment", JSON.parse(JSON.stringify(metric.data)));
      for (var j = 0; j < metric.data.length; j++)
      {
        let dat = metric.data[j];

        if("START" in dat)
        {
          let aggType = "SUM";
          if ("aggType" in metric)
          {
            aggType = metric.aggType.toUpperCase();
          }
          let utcTimestamp = +dat.START;

          // console.log("check if null", dat[aggType + "_VALUE"]);
          if(dat[aggType + "_VALUE"] == null)
          {
            data.push([utcTimestamp, null]);
          }
          else
          {
            data.push([utcTimestamp, +dat[aggType + "_VALUE"]]);
          }
        }
      }
    }


    return data;
  }

  convertDatasetsToCsv(datasets)
  {
    console.time("convertDatasetsToCsv");

    let metrics = JSON.parse(JSON.stringify(this.Metrics));

    let times = [];
    for (let dataset of datasets)
    {
      for (let data of dataset)
      {
        if("START" in data && times.findIndex(t => t == data.START) < 0 )
        {
          let utcTimestamp = +data.START;
          times.push(utcTimestamp);
        }
      }
    }

    // console.log("times", times);

    metrics = metrics.sort( (a, b) =>
    {
      return a.id - b.id;
    });


    // console.log("datasets", datasets);

    let csvString = "Date," + metrics.map( m => m.name ).toString();

    for (let time of times)
    {
      csvString += "\n" + new Date(+time);

      for (let metric of metrics)
      {
        let datset = metric.data.find( d => d.METRICID == metric.id && d.START == time);
        let aggType = ("aggType" in metric) ? metric.aggType.toUpperCase() : "SUM";
        csvString +=  "," + datset[aggType + "_VALUE"] || 0;
      }
    }
    // console.timeEnd("convertDatasetsToCsv");
    return csvString;
  }
}
