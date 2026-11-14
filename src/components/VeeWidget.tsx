import Script from 'next/script'

/**
 * The VEE accessibility widget (vee-crm.com), as Ravit received it (2026-11-11). The settings go on window.args
 * before the loader runs; lazyOnload keeps both off the critical path. The policy link points at our
 * accessibility statement.
 */
const ARGS = {
  sitekey: '63c000b423f921aa0c2aef9740279a83',
  position: 'Left',
  container: '',
  icon: '',
  access: 'https://vee-crm.com',
  styles: {
    primary_color: '#801f48',
    secondary_color: '#ff2d83',
    background_color: '#f6f6f6',
    primary_text_color: '#636363',
    headers_text_color: '#801f48',
    primary_font_size: 14,
    slider_left_color: '#801f48',
    slider_right_color: '#801f48',
    icon_vertical_position: 'bottom',
    icon_offset_top: 100,
    icon_offset_bottom: 20,
    highlight_focus_color: '#ff2d83',
    toggler_icon_color: '#ffffff',
  },
  links: {
    acc_policy: '/accessibility',
    additional_link: 'https://vee.co.il/pricing/',
  },
  options: {
    open: false,
    aaa: false,
    hide_tablet: false,
    hide_mobile: false,
    button_size_tablet: 30,
    button_size_mobile: 20,
    position_tablet: 'Left',
    position_mobile: 'Left',
    icon_vertical_position_tablet: 'bottom',
    icon_vertical_position_mobile: 'bottom',
    icon_offset_top_tablet: 100,
    icon_offset_bottom_tablet: 20,
    icon_offset_top_mobile: 100,
    icon_offset_bottom_mobile: 20,
    keyboard_shortcut: true,
    disable_headings: false,
    hide_purchase_link: false,
    display_checkmark_icon: false,
    active_toggler_color: '#118f38',
  },
  exclude: [],
}

/** The widget adds its "skip to accessibility tools" links with tabindex="1", which jumps the page's natural tab
 *  order (WCAG 2.4.3; Lighthouse flags it). They sit at the top of <body>, so tabindex="0" keeps them first anyway.
 *  The site itself never uses a positive tabindex, so the selector can be page-wide. */
const FIX_TABINDEX = `new MutationObserver(function(){document.querySelectorAll('[tabindex]:not([tabindex="0"]):not([tabindex^="-"])').forEach(function(e){e.setAttribute('tabindex','0')})}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['tabindex']});`

export function VeeWidget() {
  return (
    <>
      <Script id="vee-args" strategy="lazyOnload" dangerouslySetInnerHTML={{ __html: `window.args = ${JSON.stringify(ARGS)};${FIX_TABINDEX}` }} />
      <Script id="vee-loader" strategy="lazyOnload" src={`${ARGS.access}/js/`} crossOrigin="anonymous" data-cfasync="true" />
    </>
  )
}
