import { Config }  from "./config/config";

interface HTMLElementSVG extends HTMLElement {
  contentDocument? : Document
}

export class Sibor  {
  protected static _config : Config;
  
  public static get Config() : Config {	return this._config; }
  public static set Config(newVal : Config) {	this._config = newVal;}

  protected static _instances : Sibor[] = [];  
  public static get Instances() : Sibor[] {	return this._instances; }
  public static set Instances(newVal : Sibor[]) {	this._instances = newVal;}
  
  
  protected _contentDocument : Document;  
  public get ContentDocument() : Document {	return this._contentDocument; }

  
  protected _container : HTMLElementSVG;  
  public get Container() : HTMLElementSVG {	return this._container; }

  
  protected _htmlContainer : HTMLElement;  
  public get HTMLContainer() : HTMLElement {	return this._htmlContainer; }

  protected _config : Config;
  
  public get Config() : Config {	return this._config; }
  public set Config(newVal : Config) {	this._config = newVal;}

  protected _el : Element;  
  public get El() : Element {	return this._el; }
  public set El(newVal : Element) {	this._el = newVal; }

  public get Sibor() {	return Sibor; }

  public get Data() { return this.Config.data; }
  

  protected _siborEl : HTMLElement | SVGElement;
  
  public get SiborEl() : HTMLElement | SVGElement {	return this._siborEl; }
  public set SiborEl(newVal : HTMLElement | SVGElement) {	this._siborEl = newVal;}
  

  public get ElPosition() : DOMRect {	return this.Config.mode == "html" ? (this.El as any).getBoundingClientRect() : (this.El as any).getBBox(); }

  protected _rendering : boolean;
  
  public get Rendering() : boolean {	return this._rendering; }
  public set Rendering(newVal : boolean) {	this._rendering = newVal;}

  protected _lastRendering : Date;
  
  public get LastRendering() : Date {	return this._lastRendering; }
  public set LastRendering(newVal : Date) {	this._lastRendering = newVal;}
  
  
  
  
  

  constructor(elQuery: string, config: Config) {    
    Sibor.Instances.push(this);

    this.Config = config;
    this.InitConfigWithStaticConfig();    

    if(!this.Config.data) this.Config.data = {};

    this.Config.data = this.CreateObservable(this.Config.data, this.Render);

    this._container = document.getElementById(this.Config.SVG_ID);
    this._contentDocument  = this.Container.contentDocument;
    if(this.ContentDocument)
    {
      this._el = this.ContentDocument.querySelector<HTMLElement | SVGElement>(elQuery);

      if(this.El)
      {
        if(this.ValidMode())
        {
          this.Render();
        }
      }
      else
      {
        throw new DOMException(`Element could not be found. It seems that the element with the selector '${elQuery}' does not exist.`, "ElementNotFound");
      }
    } 
    else
    {
      throw new DOMException(`ContentDocument could not be found. It seems that the element with the id (SVG_ID) '${this.Config.SVG_ID}' does not exist.`, "ContentDocumentNotFound");
    }
  }

  public Reset()
  {
    Sibor.Instances.splice(Sibor.Instances.indexOf(this), 1);
    this.SiborEl.parentElement.removeChild(this.SiborEl);
    this.Config = {
      data: {

      }
    };        
    window.removeEventListener("scroll", this.Event_CallRenderer);
    window.removeEventListener("resize", this.Event_CallRenderer);

    this._htmlContainer = undefined;
    this._container = undefined;
    this._contentDocument = undefined;
    this._siborEl = undefined;
    this.Rendering = undefined;
    this.LastRendering = undefined;
    this._el = undefined;
  }

  public CreateObservable(obj, callback : Function): any
  {
    return new Proxy(obj, {
      get: (target, prop, reciever) => {        
        if(typeof target[prop] === "function")
        {
          return target[prop].bind(target);
        }

        return target[prop];
      },
      set: (target, prop, value) => {
                
        if(target[prop] !== value)
        {
          
          target[prop] = value; 
          callback.apply(this);
        }
        else
        {
        }
        
        return target[prop];
      },
      construct() {
        return obj;
      }
    });
  }



  public InitConfigWithStaticConfig()
  {
    for(const key in Sibor.Config)
    {
      if(key && (Sibor.Config[key] || Sibor.Config[key] === false) && (!this.Config[key] || !this.Config[key] === true))
      { //if static Config contains key but local Config does not
        this.Config[key] = Sibor.Config[key];
      }
    }
  }

  protected Event_CallRenderer(e)
  {    
    this.Render();
  }

  public InitHTMLContainer()
  {
    const id = "Sibor_HTMLContainer__" + this.Config.SVG_ID;
    const foundHTMLContainer : HTMLElement = document.querySelector(`#${id}`);
    if(!foundHTMLContainer)
    {
        this._htmlContainer = this.HtmlToElement(`
        <div style='position: absolute; background: transparent; border: none; margin: 0; padding: 0; pointer-events: none; z-index: 99999;transition: all 0.3s ease-in-out;'>
          <!-- This container will be align over the svg contentDocument. All overlayed items (mode = 'html') will be playced here. -->
          <div id='${id}' style='position: relative; width: 100%; height: 100%;'>
          </div>
        </div>
        `).children[0] as HTMLElement;
      document.body.appendChild(this.HTMLContainer.parentElement);



      window.addEventListener("scroll", this.Event_CallRenderer.bind(this));
      window.addEventListener("resize", this.Event_CallRenderer.bind(this));
    }
    else
    {
      this._htmlContainer = foundHTMLContainer;
    }    
    
  }



  public ValidMode() : boolean
  {
    switch (this.Config.mode) 
    {
      case "html": 
      case "svg":
      case "text":
        return true;
      default:
        return false;
    }
  }


  public Render(causedByTimeout? : boolean)
  {         
    if(this.Rendering) return;

    
    this.Rendering = true; 
    this.LastRendering = new Date();

    this.UpdateSiborEl();
    switch (this.Config.mode) 
    {
      case "html": 
        this.DrawHTML();
        break;
      case "svg":
        this.DrawSVG();
        break;
      case "text":
        this.ReplaceText();
        break;
      default:
        return false;
    }
    this.Rendering = false;
    setTimeout( () => {
      const now = Date.now();
      const diff = now - this.LastRendering.getTime();
      
      if(diff >= 450 && !causedByTimeout)
      {
        this.Render(true);
      }
    }, 500);
  }

  /**
   * @param {String} HTML representing a single element
   * @return {Node}
   */
  protected HtmlToElement(html) : HTMLElement
  {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild as HTMLElement;
  }

  /**
    * @param {String} HTML representing any number of sibling elements
    * @return {NodeList} 
    */
  protected HtmlToElements(html): NodeList 
  {
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content.childNodes;
  }

  public PositionHTMLContainer()
  {        
    const absContainerPos = this.Container.getBoundingClientRect();

    if(this.HTMLContainer.parentElement.style.top != `${absContainerPos.top + window.scrollY}px`)
      this.HTMLContainer.parentElement.style.top = `${absContainerPos.top + window.scrollY}px`;
    if(this.HTMLContainer.parentElement.style.left != `${absContainerPos.left + window.scrollX}px`)
      this.HTMLContainer.parentElement.style.left = `${absContainerPos.left + window.scrollX}px`;
    if(this.HTMLContainer.parentElement.style.width != `${absContainerPos.width}px`)
      this.HTMLContainer.parentElement.style.width = `${absContainerPos.width}px`;
    if(this.HTMLContainer.parentElement.style.height != `${absContainerPos.height}px`)
      this.HTMLContainer.parentElement.style.height = `${absContainerPos.height}px`;
  }

  public PositionElement(el : HTMLElement | SVGElement) {    
    el.id = `Sibor_${this.El.id}`;
    el.style.position = "absolute";
    el.style.pointerEvents= "auto";
    const pos = this.ElPosition;
    el.style.top = `${this.ElPosition.top}px`;
    el.style.left = `${this.ElPosition.left}px`;
    el.style.border = "1px solid red";
    el.style.maxWidth = `${this.ElPosition.width}px`;
    el.style.maxHeight = `${this.ElPosition.height}px`;    
  }

  public DrawHTML()
  {
    this.InitHTMLContainer();
    this.PositionHTMLContainer();      

    // this.UpdateSiborEl();   

    this.PositionElement(this.SiborEl);
    
    if(!this.HTMLContainer.querySelector(`#${this.SiborEl.id}`))
    {
      this.HTMLContainer.appendChild(this.SiborEl);   
    }

  }

  public UpdateHTMLSiborEl()
  {
    if(!this.Config.template)
    {
      this.Config.template = `
        <div style='width: 100%; height: 100%; overflow: hidden;'></div>
      `;
    }
    let nextSiborEl = null;

    if(!this.SiborEl)
    {
      if(this.Config.template.startsWith("#") )
      {      
        const template : HTMLTemplateElement = document.querySelector(this.Config.template).cloneNode(true) as HTMLTemplateElement;
        
        nextSiborEl = template.content.firstElementChild as HTMLElement;
      }
      else
      {
        const htmlStr: string = this.Config.template;

        const el : HTMLElement = this.HtmlToElement(htmlStr);   
        nextSiborEl = el;   
      }  
    }

    if(nextSiborEl) this.SiborEl = nextSiborEl; 
  }

  public UpdateSiborEl()
  {
    switch(this.Config.mode)
    {
      case "html":
        this.UpdateHTMLSiborEl();
        break;
      case "svg":
      case "text":
        this.SiborEl = this.El as SVGElement;
        break;
    }

       
  }
  

  public DrawSVG()
  {  
    //TODO: Change this so that template can also contain an id to an template element
    const svgStr : string = this.Config.template;

    if(this.El.tagName !== "g")
    {
      var xmlns = "http://www.w3.org/2000/svg";
      

      const g = document.createElementNS (xmlns, "g");
      g.setAttributeNS(null, "transform", `translate(${this.ElPosition.x}, ${this.ElPosition.y})`);
      g.innerHTML = this.El.outerHTML;
      g.innerHTML += svgStr;

      const elOld = this.El;
      const elParent = this.El.parentElement;
      elOld.remove();
      this._el = g;      
      elParent.appendChild(this.El);
      (this.El.firstChild as Element).setAttributeNS(null, "x", "0");
      (this.El.firstChild as Element).setAttributeNS(null, "y", "0");
    }
    else
    {
      this.El.innerHTML += svgStr;
    }
  }


  public ReplaceText()
  {
    let str = this.El.innerHTML;
    const datasetText = (this.El as HTMLElement).dataset.text ? (this.El as HTMLElement).dataset.text : false;    
    if(datasetText)
    {
      str = datasetText;
    }
    else
    {
      (this.El as HTMLElement).dataset.text = str;
    }

    const strMatches : string[] = str.match(/({{[a-zA-Z_$][a-zA-Z_$0-9]*}})/gi);
    const strMatchesOrig : string[] = strMatches;

    

    for(const strMatch of strMatches)
    {
      const key = strMatch.replace("{{", "").replace("}}", "");
      const value = this.Config.data[key];
      
      if(value !== undefined)
      {
        str = str.replace(strMatch, value.toString());
      }
      else
      {
      }
    }
    this.El.innerHTML = str;
    
  }
}