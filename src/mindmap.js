// Markmap rendering

import { Transformer } from 'markmap-lib';
import { Markmap, loadCSS, loadJS } from 'markmap-view';

const transformer = new Transformer();
let markmapInstance = null;

export function renderMindMap(svgElement, markdown) {
  // Transform markdown to markmap data
  const { root, features } = transformer.transform(markdown);

  // Get assets needed for rendering
  const { styles, scripts } = transformer.getUsedAssets(features);

  // Load any required CSS
  if (styles) loadCSS(styles);

  // Load any required JS
  if (scripts) {
    loadJS(scripts, {
      getMarkmap: () => ({ Markmap, loadCSS, loadJS })
    });
  }

  // Clear previous instance
  svgElement.innerHTML = '';

  // Create the markmap
  markmapInstance = Markmap.create(svgElement, {
    colorFreezeLevel: 2,
    duration: 500,
    maxWidth: 300,
  }, root);

  // Fit the view after rendering
  setTimeout(() => {
    if (markmapInstance) {
      markmapInstance.fit();
    }
  }, 100);
}

export function clearMindMap(svgElement) {
  if (markmapInstance) {
    markmapInstance = null;
  }
  if (svgElement) {
    svgElement.innerHTML = '';
  }
}
