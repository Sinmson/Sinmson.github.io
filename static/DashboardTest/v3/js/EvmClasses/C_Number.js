console.log("C_Number.js");


window.EvmClasses.Number = class extends window.EvmClasses.Metrics {
  constructor(args) {
    if(!args) args = {};
    super(args);
    this._unit      = (args.unit)     ? args.unit     : "";
    this._fontSize  = (args.fontSize) ? args.fontSize : 24;
    this._aggType   = (args.aggType)  ? args.aggType  : "SUM";

    //console.log("Number initialisiert.", this);
  }

  set Unit(newVal)      { this._unit      = newVal;  if(this.Debug) { console.log("unit = "     + newVal); }}
  set FontSize(newVal)  { this._fontSize  = newVal;  if(this.Debug) { console.log("fontSize = " + newVal); }}
  set AggType(newVal)   { this._aggType   = newVal;  if(this.Debug) { console.log("aggType = "  + newVal); }}

  get Unit()      { return this._unit || "";      }
  get FontSize()  { return this._fontSize;  }
  get AggType()   { return this._aggType || "SUM";   }


  aggregateMetric(metric)
  {
    let value = NaN;
    if(metric && metric.data && metric.data.length > 0)
    {
      let validData = metric.data.filter( d => d.SUM_VALUE && d.SUM_VALUE != NaN && d.START >= window.EvmClasses.TimeStart && d.START <= window.EvmClasses.TimeEnd);
      //console.log("aggregateMetric", validData);
      //console.log("TimeStart", new Date(window.EvmClasses.TimeStart));
      //console.log("TimeEnd  ", new Date(window.EvmClasses.TimeEnd));
      let aggType = "SUM";
      if ("aggType" in metric)
      {
        aggType = metric.aggType.toUpperCase();
      }
      else if(this.AggType)
      {
        aggType = this.AggType.toUpperCase() || "SUM";
      }

      let sum = 0;
      let min = Math.min.apply(Math, validData.map( datset => { return datset.MIN_VALUE; } ));
      let max = Math.max.apply(Math, validData.map( datset => { return datset.MAX_VALUE; } ));

      for(let datset of validData)
      {
        sum += +datset.SUM_VALUE;
      }

      let avg = (sum / validData.length);
      let avgRound2DigitsBehind = Math.round(avg,2);

      if(this.Debug)
      {
        //console.log("aggregateMetric -> datasets", validData);
        //console.log("aggregateMetric -> sum", sum);
        //console.log("aggregateMetric -> min", min);
        //console.log("aggregateMetric -> max", max);
        //console.log("aggregateMetric -> avg", avgRound2DigitsBehind);
      }

      switch (aggType)
      {
        case "SUM":
          value = sum;
          break;
        case "MAX":
          value = max;
          break;
        case "MIN":
          value = min;
          break;
        case "AVG":
          value = avgRound2DigitsBehind;
          break;
        default:
          value = sum;
      }

      return value;
    }
    else
    {
      return "[No Data]";
    }
  }

  loadValues(metrics)
  {
    if(this.Debug)
    {
      //console.log("loadValues metrics", metrics);
    }

    for (let metric of metrics)
    {
      metric.value = this.aggregateMetric(metric);
    }
  }

  draw()
  {
    super.draw();
    this.El.classList.add("number");
  }

  callbackUpdate(message)
  {
    super.callbackUpdate(message);


    switch (message) {
      case "Updated Times":
      case "Updated Metrics":
        this.loadValues(this.Metrics, this.Datasets);
        this.redrawNumber();
        break;
    }
  }

  drawNumber()
  {
    if(this.ElContainer)
    {
      this.ElContainer.innerText = "";
      this.ElContainer.style.fontSize = (this.FontSize || this.Metrics[0].fontSize) + "px";
      for (let metric of this.Metrics)
      {
        let p = document.createElement("p");
        p.innerText = (metric.value.toString() || "") + (metric.unit || this.Unit);
        p.title = (metric.aggType || this.AggType) + " of " + (metric.name || metric.unit || this.Unit);
        p.style.fontSize = (metric.fontSize || this.FontSize) + "px";
        p.classList.add("numberText");

        this.ElContainer.appendChild(p);
      }
    }
    else
    {
      this.drawContainer();
    }
  }


  redrawNumber()
  {
    //console.log("redrawNumber",  JSON.parse( JSON.stringify (this.Metrics[0])));
    this.drawNumber();
  }

  updateView()
  {
    // super.updateView(); Not existing

    if(this.Debug)
    {
      //console.log("updateView", this.Metrics);
    }

    this.redrawNumber();
  }
}
