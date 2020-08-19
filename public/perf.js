function po_handler(list, observer) {
  console.log('Perf', list.getEntries()
    .filter(entry => entry.entryType === 'mark')
    .map(entry => entry.name))
}
export const po = new PerformanceObserver(po_handler)
po.observe({ entryTypes: ['resource', 'measure', 'paint', 'mark'] })
performance.mark('the begining')
