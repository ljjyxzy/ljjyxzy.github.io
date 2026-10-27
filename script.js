/* ============================================================
   magicJJ · 学习笔记  —  交互脚本
   ------------------------------------------------------------
   设计取舍：不做「每张卡片滚动淡入」——那是被点名的生成感默认。
   只保留一次编排好的页面载入，以及响应用户操作的动效。
   ============================================================ */

(function () {
  'use strict';

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  }

  function clampInt(v, lo, hi, fb) {
    var n = parseInt(v, 10);
    if (isNaN(n)) return fb;
    return n < lo ? lo : (n > hi ? hi : n);
  }

  /* ---------- 文章详情页：按 ?id=N 切换 ---------- */
  function initDetail() {
    var stack = $('.art-stack');
    if (!stack) return;

    var arts = $$('.art', stack);
    if (!arts.length) return;

    var total = arts.length;
    var id = clampInt(new URLSearchParams(location.search).get('id'), 1, total, 1);

    arts.forEach(function (el) {
      el.classList.toggle('on', parseInt(el.getAttribute('data-post'), 10) === id);
    });

    // 标题同步
    var cur = arts.filter(function (el) { return el.classList.contains('on'); })[0];
    if (cur) {
      var h = $('h1', cur);
      if (h) document.title = h.textContent.trim() + ' · magicJJ';
    }

    // 上一篇 / 下一篇
    var prev = $('#prev-post'), next = $('#next-post');
    if (prev) {
      if (id < total) {
        prev.setAttribute('href', 'post.html?id=' + (id + 1));
        prev.classList.remove('hide');
      } else {
        prev.classList.add('hide');
        prev.removeAttribute('href');
      }
    }
    if (next) {
      if (id > 1) {
        next.setAttribute('href', 'post.html?id=' + (id - 1));
        next.classList.remove('hide');
      } else {
        next.classList.add('hide');
        next.removeAttribute('href');
      }
    }
  }

  /* ---------- 归档页：按 ?tag= 筛选 ---------- */
  function initArchiveFilter() {
    var list = $('.arch');
    if (!list) return;

    var items = $$('li', list);
    var desc = $('#arch-desc');
    var end = $('#arch-end');
    var tag = (new URLSearchParams(location.search).get('tag') || '').trim();

    // 无参数：显示全部
    if (!tag) {
      if (end) end.textContent = '—— 到底了 ——';
      return;
    }

    var hits = 0;
    items.forEach(function (li) {
      var tags = (li.getAttribute('data-tags') || '').split('|');
      var hit = tags.indexOf(tag) !== -1;
      li.classList.toggle('is-hit', hit);
      li.classList.toggle('is-dim', !hit);
      if (hit) hits++;
    });

    if (desc) {
      desc.textContent = '筛选标签：' + tag + '，命中 ' + hits + ' 篇。';
    }
    if (end) {
      end.textContent = hits
        ? '—— 以上 ' + hits + ' 篇 ——'
        : '—— 没有匹配的笔记 ——';
    }

    document.title = tag + ' · 归档 · magicJJ';
  }

  /* ---------- 单次编排的载入：主内容轻微上浮 ---------- */
  function initReveal() {
    var reduce = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    var target = $('.notes') || $('.art-stack') || $('.arch') || $('.prose');
    if (!target) return;

    target.style.opacity = '0';
    target.style.transform = 'translateY(8px)';
    target.style.transition =
      'opacity 0.6s cubic-bezier(0.22,0.61,0.36,1), ' +
      'transform 0.6s cubic-bezier(0.22,0.61,0.36,1)';

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        target.style.opacity = '1';
        target.style.transform = 'translateY(0)';
      });
    });
  }

  function boot() {
    initDetail();
    initArchiveFilter();
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
