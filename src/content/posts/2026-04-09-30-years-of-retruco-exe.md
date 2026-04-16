---
title: "30 years of RETRUCO.exe"
shortTitle: "RETRUCO 30 years"
date: 9 April 2026
author: Webmaster Eric
featured: true
clippy:
  message: "It looks like **30 years of RETRUCO.exe** was too nostalgic to leave trapped in a Windows 98 VM forever."
  href: "window:retruco"
  label: "Click here to play RETRUCO in your browser."
---
There, I tasked Codex with a wonderful project and guided it through the process of reverse engineering this absolute niche but nostalgia-loaded Argentinian Truco card game freeware for Windows 95. If you’ve never heard of Truco, it’s a loud, fast card game from Argentina where bluffing, trash talk, and acting confident matter just as much as the cards in your hand. It's a huge part of Argentinian culture.

I found it a few years ago, I can't tell you how happy I was to find it on some obscure, now abandonware website preserved through a Geocities archive, and be able to hear that tango MIDI background music again, along with the undoubtedly homemade player dialogs that cracked me up so much as a kid as me and my older siblings used to play all the time in my mom's [Compaq Presario 2200](https://www.youtube.com/watch?v=UesfzT6WjhM).

There was no truco PC game remotely close to it back then, especially not one supporting team play, even if obviously offline and with all CPU players besides you.

Running it natively was just not possible on a modern Windows setup. I had to do it through a Windows 98 VM, and it's simply not straightforward to put it inside. Enabling networking to download is already painful, let alone making Internet Explorer 4 load anything even vaguely compatible with today's standards. Fancier VM solutions let you drag and drop a zip file into the guest OS out of the box, but I was using free VirtualBox and getting that to work is also a hassle. Heck, even a zip file requires WinRAR to be installed first! But eventually I was able to run it, play it and be 10 years old again.

Fast forward to 2026, 30 years since it was originally released by its author, Rolando Herrera: here's my tribute to my RETRUCO's childhood days, now in pure JavaScript glory.

I naively tried contacting Rolando using the e-mail addresses found in the README and help files from 1996 (lol), but of course none of those exist anymore and you get a delivery rejection instantly. I  was desperately trying to know who made the tango background music, which no state-of-the-art algorithm by Shazam could decrypt for me. Only much later, thanks to an actual tango expert that worked with my mom, I found out it was a lesser-known Carlos Gardel piece: _A la luz de un candil_. 

<strong>Back to the game  JavaScript reimplementation</strong>: some bits are still missing from the original, but it's fully playable, supports the original voices and even the MIDI tango background music, using [webaudio-tinysynth](https://github.com/g200kg/webaudio-tinysynth) since no modern browsers support MIDI playback natively anymore.

<p style="text-align: center; font-size: 110%;"><a href="javascript:void(0)" data-open-window="retruco">Click here to play RETRUCO in your browser</a></p>

Thank you, Rolando, for making such a bizarre, heart-warming little masterpiece. I hope someday you will stumble upon this post and let me know you saw it.

<span style="font-size: 90%">_Hopefully it won't be for a copyright infringement notice._ (ಥ﹏ಥ)</span>
