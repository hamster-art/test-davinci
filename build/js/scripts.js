/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*global $*/
$(document).ready(function () {
  new Swiper('.js-slider', {
    spaceBetween: 12,
    slidesPerView: 'auto',
    navigation: {
      nextEl: '.js-slider-right',
      prevEl: '.js-slider-left'
    }
  });
  $(".js-form").submit(function (e) {
    e.preventDefault();
    console.log('Hello, World!');
  });
});
/******/ })()
;