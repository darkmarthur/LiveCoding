// https://github.com/tidalcycles/Dirt-Samples
// https://github.com/tidalcycles/Clean-Samples
// https://github.com/mamalLivecoder/samples

samples('https://samples.grbt.com.au/strudel.json')
samples('github:mamallivecoder/samples')
samples('github:tidalcycles/dirt-samples')
samples('github:tidalcycles/clean-samples')
samples('github:kyrsive/gc-glitches')
samples('github:kyrsive/gc-wavetables')

samples({
jp1: '234965__reitanna__japanese-what-do-you-want.wav',
jp2: '235019__reitanna__japanese-hey.wav',
jp3: '235128__reitanna__japanese-please.wav',
jp4: '235154__reitanna__japanese-no-way.wav',
jp5: '235155__reitanna__japanese-no.wav',
jp6: '241215__reitanna__japanese-phrase-request.wav',
jp7: '323192__alivvie__hisashiburi1.mp3',
jp8: '323208__alivvie__ohayou2.mp3'
 }, 'https://raw.githubusercontent.com/darkmarthur/LiveCoding/main/utils/samples/');

JPVOX: s("<jp1 jp2 jp3>")
  .scrub(rand.seg(16))
  .gain(1.8)
  .fast(2)
  .room(2)


_GLITCH: n("9 8 6 18 20").s("gglitch")
  .speed(11)
  .dist(2)
  .clip(0.8)
  .fast("1 2")
  .cut(9)
  .delay("[.2|0]").delaytime("0.005 0.003 0.001").delayfb("0.99")
  // .phaser(2)
  // .mask("<0 1 1 0 1 0 0 0 0>*2")
  .gain(0.5)






