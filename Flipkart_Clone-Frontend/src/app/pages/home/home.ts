import { Component } from '@angular/core';
import { Navbar } from "../../components/navbar/navbar";
import { Categorybar } from "../../components/categorybar/categorybar";
import { Slidingbanner } from "../../components/slidingbanner/slidingbanner";
import { Banner } from "../../components/banner/banner";
import { Topdeals } from "../../components/topdeals/topdeals";
import { Dealgrid } from "../../components/dealgrid/dealgrid";
import { Furnituredeal } from "../../components/furnituredeal/furnituredeal";
import { Topstories } from "../../components/topstories/topstories";
import { Footer } from "../../components/footer/footer";

@Component({
  selector: 'app-home',
  imports: [Navbar, Categorybar, Slidingbanner, Banner, Topdeals, Dealgrid, Furnituredeal, Topstories, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
// Data for Fashion Grid
  fashionItems = [
    { title: "Men's Sports Shoes", subTitle: 'Min. 70% Off', imageUrl: 'https://rukminim2.flixcart.com/image/420/420/xif0q/shoe/d/b/x/6-biss-2031-blu-wht-40-bruton-blue-original-imahczyufwkmpeyq.jpeg?q=60' },
    { title: "Men's Slippers & Flip Fl...", subTitle: 'Min. 70% Off', imageUrl: 'https://rukminim2.flixcart.com/image/420/420/xif0q/slipper-flip-flop/4/i/c/8-eagle-f-b-black-06-cloker-black-original-imahgphm8hznjvdg.jpeg?q=60' },
    { title: "Men's Casual Shoes", subTitle: 'Min. 70% Off', imageUrl: 'https://rukminim2.flixcart.com/image/420/420/xif0q/shoe/k/e/r/7-sneaker-7-echor-white-blue-original-imahf9ps8wwbzfyv.jpeg?q=60' },
    { title: "Wrist Watches", subTitle: 'Min. 90% Off', imageUrl: 'https://rukminim2.flixcart.com/image/420/420/xif0q/shopsy-watch/i/4/n/1-arabic-vilante-men-women-original-imahgd8ztspm6f6h.jpeg?q=60' }
  ];

  // Data for Home Grid
  homeItems = [
    { title: "Wall Clocks", subTitle: 'Min. 50% Off', imageUrl: 'https://rukminim2.flixcart.com/image/420/420/xif0q/shopsy-wall-clock/g/8/y/cherry-art-amori-small-cherry-amori-1601-analog-maxwell-original-imagjvtdsjfaspzk.jpeg?q=60' },
    { title: "Blankets", subTitle: 'Hand-picked', imageUrl: 'https://rukminim2.flixcart.com/image/420/420/xif0q/blanket/7/k/v/self-design-emboos-printed-blanket-printed-db-01-t1-gkm-original-imahfxbchqufffrs.jpeg?q=60' },
    { title: "Pillows", subTitle: 'Min. 50% Off', imageUrl: 'https://rukminim2.flixcart.com/image/420/420/xif0q/pillow/c/h/s/15-g-4new-uiit77-4-g-4new-uit77-goga-original-imaguhgry7bpzzvk.jpeg?q=60' },
    { title: "Mosquito Nets", subTitle: 'New Collection', imageUrl: 'https://rukminim2.flixcart.com/image/420/420/xif0q/mosquito-net/g/y/i/double-bed-flower-design-light-blue-color-double-bed-6-x7-ft-72-original-imahcf3apysmuzya.jpeg?q=60' }
  ];

}
