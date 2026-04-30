import { html } from '../../utils/template-helpers.js';
// Import dependencies
import '../ui/base-button.js';

export class HeroSection extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = /*html*/ `
      <style>@import url('./src/styles/components/shared.css');</style>
      <style>@import url('./src/styles/components/hero.css');</style>
      <div class="hero">
        <div class="asymmetric-grid" aria-hidden="true">
          <div class="grid-item item-1">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0itoZfChtK37oZQreWs5ygKRyOszBzK1Te_hUWw1zGRdA0D5Fex9fgh7lpezWAFrs3k8PiOna7XJ5u0qIF5cUqh0sOnnL8aLOWBYK1CojIbE2RxNRZbleWLZHgmmfNNzX2Wf_OT6Bro9TpqYXZcZ7lr_OQCm_5l2Lz2tFPZHC2M_8Qap6YV7gy9vy2Pqu57bu96Mf4HQ2CtKnt3BHGbvmAHc5SsFeB_ZU5h5p0fOJrl57wof1LOl2U4piQRRG4Oc2BPRbdKNFjKs" alt="">
          </div>
          <div class="grid-item item-2">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDU66Nk9yGsSpcnxSQIBHPi4Om_DML_ZWo7VR9rzFi8PHIK6Kp_zGGmN8H0P-pY1SvWK34JrdTa7vUkMW2BIOzXaqsyoOX8zMKPWh0FBxt_t-uGquhSip5TI8jMSys1dr-JjPk16W9Y7AU9PCRFeJnKeGV_-ygGh2Ao9MjuG4MkiFiuiWM83VR9qZwgdsWPYSI4itd2vvhlrf5GPSJXnFIiRrMx17nGxAiJOVIytSqbM-bepmMOaYiWmVZGsS4R9IWRjTg5oz7f5yQ" alt="">
          </div>
          <div class="grid-item item-3">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAa_bL6Ngsk5QkoI1eJf2DonAWsY52YM8Me-IdULB9uYeBUGT225Nz8WYA4NbG9zSwv8iT00xmytITQ_8FRd55U_ACqD-SZmElpB0rre84v11C3N5HnaIJPM572VKCwOQ9MVSZ1P_SuSa2-hYhZ8cS-PWCNAupfcRXuHVIEjq8AIQ02NZLmdOzYdwIFA7XC1iFTBRM_e_bCOPV-Tnbp3DgKsaMYIUbef-LHF1clyVIM9mM9VqbPq6HXXaovCvgXJ6QSb8Ura10f9R0" alt="">
          </div>
          <div class="grid-item item-4">
             <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBx2GXwPsZy5WTZIu9PEDr6LCwxiE5Kyi1K90_4_E-z0zuYyuGLRhdtIZJevtstbYi0Q0GXivqA-Asj_82iE8m7wuwROqkJedewufPn8LNgxXLYJXCspHSRKP5BVKZEh0tTq9QbQ1gwaAISBIIdzTbDWp3cSlXb8Ct1uJH3hOzws5od8z7r1Ue_TAdBRuusOKyAxmeKbewVchWdjJRC4M-WF_OH3M8ngtK5kaeq82k7EgzIu_STmmYOdgzbtu4TTJ8vCC0sb1-qz-c" alt="">
          </div>
          <div class="grid-item item-5">
             <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbVj4on6vq3B4Rm4FJsR6TYOlkJ-lSewzBQv7xtIfkYIF_8py3qO_no0vnBwX0yQHPNUL18KJ7xl8uKpYfeQZR17ivajbgtUAlyVDf_3iLq98NHAKfmsg4nyJY7mIlwSIN_l2L8wZk-Gv6HtRvXpUhAEBVTbofKJIIB7Ku1puYSYTU4zDN1x9K_f0M5ZZNDvSJ_knJjNJ6D3dn8XGmhJvyIr0pj9BS66ytv7A60SDOYd6HQ8zh_wRUeh97nibzcKYzaK6-IIcZVNk" alt="">
          </div>
          <div class="grid-item item-6">
             <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlKNlTq9suAvzxmjLAqv_LVoy8N-vhh8ukAWvV0tD5ywCnbFfzXHrunktQME6Ry9GBVcRqpkT8wK6DsoWJ-82ym66buq9AtrXKONJiPjz5xrI3-Kow3y3V3acoCos2XG0E6mUechlsxPfNWdAB0z8nDXxmRzyV2yk6siKYiLJdbirypr3yIuef_nF9TQqE34SR7-uVzS-5sjbe7tC_N7v4VwHHo5ojXf_Kk02KgHZiwsMhFhzlPCEPtA9zStXg0yRP1w7XX-BkUjw" alt="">
          </div>
          <div class="grid-item item-7">
             <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDU66Nk9yGsSpcnxSQIBHPi4Om_DML_ZWo7VR9rzFi8PHIK6Kp_zGGmN8H0P-pY1SvWK34JrdTa7vUkMW2BIOzXaqsyoOX8zMKPWh0FBxt_t-uGquhSip5TI8jMSys1dr-JjPk16W9Y7AU9PCRFeJnKeGV_-ygGh2Ao9MjuG4MkiFiuiWM83VR9qZwgdsWPYSI4itd2vvhlrf5GPSJXnFIiRrMx17nGxAiJOVIytSqbM-bepmMOaYiWmVZGsS4R9IWRjTg5oz7f5yQ" alt="">
          </div>
          <div class="grid-item item-8">
             <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbVj4on6vq3B4Rm4FJsR6TYOlkJ-lSewzBQv7xtIfkYIF_8py3qO_no0vnBwX0yQHPNUL18KJ7xl8uKpYfeQZR17ivajbgtUAlyVDf_3iLq98NHAKfmsg4nyJY7mIlwSIN_l2L8wZk-Gv6HtRvXpUhAEBVTbofKJIIB7Ku1puYSYTU4zDN1x9K_f0M5ZZNDvSJ_knJjNJ6D3dn8XGmhJvyIr0pj9BS66ytv7A60SDOYd6HQ8zh_wRUeh97nibzcKYzaK6-IIcZVNk" alt="">
          </div>
          <div class="grid-item item-9">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0itoZfChtK37oZQreWs5ygKRyOszBzK1Te_hUWw1zGRdA0D5Fex9fgh7lpezWAFrs3k8PiOna7XJ5u0qIF5cUqh0sOnnL8aLOWBYK1CojIbE2RxNRZbleWLZHgmmfNNzX2Wf_OT6Bro9TpqYXZcZ7lr_OQCm_5l2Lz2tFPZHC2M_8Qap6YV7gy9vy2Pqu57bu96Mf4HQ2CtKnt3BHGbvmAHc5SsFeB_ZU5h5p0fOJrl57wof1LOl2U4piQRRG4Oc2BPRbdKNFjKs" alt="">
          </div>
          <div class="grid-item item-10">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlKNlTq9suAvzxmjLAqv_LVoy8N-vhh8ukAWvV0tD5ywCnbFfzXHrunktQME6Ry9GBVcRqpkT8wK6DsoWJ-82ym66buq9AtrXKONJiPjz5xrI3-Kow3y3V3acoCos2XG0E6mUechlsxPfNWdAB0z8nDXxmRzyV2yk6siKYiLJdbirypr3yIuef_nF9TQqE34SR7-uVzS-5sjbe7tC_N7v4VwHHo5ojXf_Kk02KgHZiwsMhFhzlPCEPtA9zStXg0yRP1w7XX-BkUjw" alt="">
          </div>
          <div class="grid-item item-11">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBx2GXwPsZy5WTZIu9PEDr6LCwxiE5Kyi1K90_4_E-z0zuYyuGLRhdtIZJevtstbYi0Q0GXivqA-Asj_82iE8m7wuwROqkJedewufPn8LNgxXLYJXCspHSRKP5BVKZEh0tTq9QbQ1gwaAISBIIdzTbDWp3cSlXb8Ct1uJH3hOzws5od8z7r1Ue_TAdBRuusOKyAxmeKbewVchWdjJRC4M-WF_OH3M8ngtK5kaeq82k7EgzIu_STmmYOdgzbtu4TTJ8vCC0sb1-qz-c" alt="">
          </div>
          <div class="grid-item item-12">
               <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAa_bL6Ngsk5QkoI1eJf2DonAWsY52YM8Me-IdULB9uYeBUGT225Nz8WYA4NbG9zSwv8iT00xmytITQ_8FRd55U_ACqD-SZmElpB0rre84v11C3N5HnaIJPM572VKCwOQ9MVSZ1P_SuSa2-hYhZ8cS-PWCNAupfcRXuHVIEjq8AIQ02NZLmdOzYdwIFA7XC1iFTBRM_e_bCOPV-Tnbp3DgKsaMYIUbef-LHF1clyVIM9mM9VqbPq6HXXaovCvgXJ6QSb8Ura10f9R0" alt="">
          </div>
        </div>
        
        <div class="overlay"></div>
        
        <div class="content">
          <h1>
            Where Nature <br/>
            <span class="text-primary">Meets Wonder</span>
          </h1>
          <p>
            Explore Hidden Wonders with Eco-Friendly Tours Pura Vida: Adventure, Wildlife, Relaxation & Sustainable Luxury.
          </p>
          <div class="btn-group">
            <base-button variant="primary">Get Inspired</base-button>
            <base-button variant="secondary">Start Planning</base-button>
          </div>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('hero-section')) {
  customElements.define('hero-section', HeroSection);
}
