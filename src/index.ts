import "./main.scss";
import { Sibor } from "./framework/sibor";


window.onload = function() {  
  Sibor.Config = {
    SVG_ID: "test_SVG"
  };


  (<any>window).rect_top_left = new Sibor("#rect_top_left", {
    mode: "html",
    template: "#tmpl_test"
  });
  console.log((<any>window).rect_top_left);
  

  (<any>window).rect_bottom_right = new Sibor("#rect_bottom_right", {
    mode: "svg", //html, text, svg
    template: `
      <text x='5' y='20'>Hello Judith</text>
    `
  });
  console.log((<any>window).rect_bottom_right);


  (<any>window).text_top_right = new Sibor("#text_top_right", {
    mode: "text",
    data: {
      jahre: 20,
      hoehe: 180
    }
  });
  console.log((<any>window).text_top_right);

}
