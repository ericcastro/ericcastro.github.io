---
title: Binance Trading Bots
period: "2021"
intro: Low-latency crypto monitoring bots built to catch sudden micro-movements.
summary: Low-latency experiments in crypto spike detection and rapid trading.
links: []
color: green
x: 12
y: 134
width: 150
order: 3
---
This was a period of heavy experimentation around trading APIs, latency, and the tiny windows where automated reactions can still matter.

The idea was to speculate that small spikes had a high chance of continuing upward for just a little longer, then profit from that small price difference at extremely low latencies. A big part of the experimentation was around running the bots from AWS VMs in Tokyo and Singapore to stay as close as possible to the exchange infrastructure.

- Low-latency monitoring of every crypto ticker
- Detection of sudden price spikes and short-lived momentum
- A lot of experimentation with exchange APIs and execution timing

Eventually it stopped being fun and stopped being worth it, once the whole space became an arms race between bots fighting for the last possible millisecond, which in turn reduced the chances of profit as more people started realizing that slight advantage.
