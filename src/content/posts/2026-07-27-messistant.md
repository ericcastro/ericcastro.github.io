---
title: "Messistant: Messi assists"
shortTitle: "Messistant"
date: 27 July 2026
author: Webmaster Eric
featured: true
clippy:
  message: "It looks like **Messistant** is making Eric's WhatsApp mess considerably more Messi."
  href: "https://github.com/ericcastro/messistant"
  label: "See the source code."
---
Argentina lost the World Cup final eight days ago, so naturally the internet is once again full of people celebrating Messi's downfall and explaining why Argentina is apparently responsible for everything wrong with football.

Perfect time to release Messistant.

<p class="post-image-frame"><img src="/images/projects/messistant.jpg" alt="Lionel Messi in an Argentina shirt holding a WhatsApp logo." /></p>

## Messages are messy

Sometimes they just need a Messi assist.

Messistant is my self-hosted WhatsApp assistant: a collection of small assists triggered directly from conversations.

It originally started with this:

    !!!

Reply with `!!!` to a message and Messistant explains it — particularly useful for Argentine Spanish, where technically knowing Spanish does not necessarily prepare you for whatever nonsense we just said.

There is also:

    !conj tener vos

for conjugations, because languages enjoy having rules and then immediately finding creative ways of ignoring them.

And then there is probably my favourite:

    !stt

Reply to a voice note with that and Messistant transcribes it, in multiple languages.

WhatsApp already does transcription in some languages, but that's not really why I wanted this.

This exists because some people have apparently decided that writing is obsolete and every passing thought deserves to become a three-minute podcast episode.

A voice message forces me to stop whatever I'm doing, find somewhere I can listen to it, and then spend three minutes discovering that roughly 50% of its information content was *eeeh… alors… du coup… enfin… bref…*

Text lets me scan that in ten seconds.

So yes, `!stt` is accessibility and multilingual transcription.

But spiritually, it is also a passive-aggressive educational tool for people who send too many voice messages.

Messistant also keeps private messaging statistics with things like:

    !stats today
    !stats week

because apparently after instrumenting computers, services, sensors and half my life, I eventually decided my WhatsApp usage needed observability too.

Underneath it all, Messistant is designed around independent assists with their own access rules, so I can keep adding stupidly specific little abilities without turning the whole thing into one gigantic regrettable script.

It's still an MVP, but it has crossed the important threshold from dumb idea I found amusing to dumb idea I found amusing and now genuinely use.

And given the current state of football discourse, I feel the name has only become more appropriate.

Messi still assists.

<p class="post-cta-button"><a href="https://github.com/ericcastro/messistant">See Messistant on GitHub</a></p>
