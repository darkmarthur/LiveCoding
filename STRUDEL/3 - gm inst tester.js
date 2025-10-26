// ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø, ✧ ✦ ✧  @title GM INST TESTER   ✧ ✦ ✧ ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,
// ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø, ✧ ✦ ✧ @by Mario D. Quiroz  ✧ ✦ ✧ ¸,ø¤º°`°º¤ø,¸¸,ø¤º°`°º¤ø,¸


// Listen all the GM instruments right out from strudel
setcpm(120/4)
n("0 2 4 5 7 9 11 12")
  .scale('C4:major')
  .sound("<gm_accordion gm_acoustic_bass gm_acoustic_guitar_nylon gm_acoustic_guitar_steel gm_agogo gm_alto_sax gm_applause gm_bagpipe gm_bandoneon gm_banjo gm_baritone_sax gm_bassoon gm_bird_tweet gm_blown_bottle gm_brass_section gm_breath_noise gm_celesta gm_cello gm_choir_aahs gm_church_organ gm_clarinet gm_clavinet gm_contrabass gm_distortion_guitar gm_drawbar_organ gm_dulcimer gm_electric_bass_finger gm_electric_bass_pick gm_electric_guitar_clean gm_electric_guitar_jazz gm_electric_guitar_muted gm_english_horn gm_epiano1 gm_epiano2 gm_fiddle gm_flute gm_french_horn gm_fretless_bass gm_fx_atmosphere gm_fx_brightness gm_fx_crystal gm_fx_echoes gm_fx_goblins gm_fx_rain gm_fx_sci_fi gm_fx_soundtrack gm_glockenspiel gm_guitar_fret_noise gm_guitar_harmonics gm_gunshot gm_harmonica gm_harpsichord gm_helicopter gm_kalimba gm_koto gm_lead_1_square gm_lead_2_sawtooth gm_lead_3_calliope gm_lead_4_chiff gm_lead_5_charang gm_lead_6_voice gm_lead_7_fifths gm_lead_8_bass_lead gm_marimba gm_melodic_tom gm_music_box gm_muted_trumpet gm_oboe gm_ocarina gm_orchestra_hit gm_orchestral_harp gm_overdriven_guitar gm_pad_bowed gm_pad_choir gm_pad_halo gm_pad_metallic gm_pad_new_age gm_pad_poly gm_pad_sweep gm_pad_warm gm_pan_flute gm_percussive_organ gm_piano gm_piccolo gm_pizzicato_strings gm_recorder gm_reed_organ gm_reverse_cymbal gm_rock_organ gm_seashore gm_shakuhachi gm_shamisen gm_shanai gm_sitar gm_slap_bass_1 gm_slap_bass_2 gm_soprano_sax gm_steel_drums gm_string_ensemble_1 gm_string_ensemble_2 gm_synth_bass_1 gm_synth_bass_2 gm_synth_brass_1 gm_synth_brass_2 gm_synth_choir gm_synth_drum gm_synth_strings_1 gm_synth_strings_2 gm_taiko_drum gm_telephone gm_tenor_sax gm_timpani gm_tinkle_bell gm_tremolo_strings gm_trombone gm_trumpet gm_tuba gm_tubular_bells gm_vibraphone gm_viola gm_violin gm_voice_oohs gm_whistle gm_woodblock gm_xylophone>")
  // advances to the next instrument every cycle


// this doestn work
//   // --- Tempo / CPS ---
// setcpm(120/4)

// // --- GM list (clean) ---
// const GM = [
//   'gm_accordion','gm_acoustic_bass','gm_acoustic_guitar_nylon','gm_acoustic_guitar_steel','gm_agogo',
//   'gm_alto_sax','gm_applause','gm_bagpipe','gm_bandoneon','gm_banjo','gm_baritone_sax','gm_bassoon',
//   'gm_bird_tweet','gm_blown_bottle','gm_brass_section','gm_breath_noise','gm_celesta','gm_cello',
//   'gm_choir_aahs','gm_church_organ','gm_clarinet','gm_clavinet','gm_contrabass','gm_distortion_guitar',
//   'gm_drawbar_organ','gm_dulcimer','gm_electric_bass_finger','gm_electric_bass_pick',
//   'gm_electric_guitar_clean','gm_electric_guitar_jazz','gm_electric_guitar_muted','gm_english_horn',
//   'gm_epiano1','gm_epiano2','gm_fiddle','gm_flute','gm_french_horn','gm_fretless_bass','gm_fx_atmosphere',
//   'gm_fx_brightness','gm_fx_crystal','gm_fx_echoes','gm_fx_goblins','gm_fx_rain','gm_fx_sci_fi',
//   'gm_fx_soundtrack','gm_glockenspiel','gm_guitar_fret_noise','gm_guitar_harmonics','gm_gunshot',
//   'gm_harmonica','gm_harpsichord','gm_helicopter','gm_kalimba','gm_koto','gm_lead_1_square',
//   'gm_lead_2_sawtooth','gm_lead_3_calliope','gm_lead_4_chiff','gm_lead_5_charang','gm_lead_6_voice',
//   'gm_lead_7_fifths','gm_lead_8_bass_lead','gm_marimba','gm_melodic_tom','gm_music_box','gm_muted_trumpet',
//   'gm_oboe','gm_ocarina','gm_orchestra_hit','gm_orchestral_harp','gm_overdriven_guitar','gm_pad_bowed',
//   'gm_pad_choir','gm_pad_halo','gm_pad_metallic','gm_pad_new_age','gm_pad_poly','gm_pad_sweep','gm_pad_warm',
//   'gm_pan_flute','gm_percussive_organ','gm_piano','gm_piccolo','gm_pizzicato_strings','gm_recorder',
//   'gm_reed_organ','gm_reverse_cymbal','gm_rock_organ','gm_seashore','gm_shakuhachi','gm_shamisen',
//   'gm_shanai','gm_sitar','gm_slap_bass_1','gm_slap_bass_2','gm_soprano_sax','gm_steel_drums',
//   'gm_string_ensemble_1','gm_string_ensemble_2','gm_synth_bass_1','gm_synth_bass_2','gm_synth_brass_1',
//   'gm_synth_brass_2','gm_synth_choir','gm_synth_drum','gm_synth_strings_1','gm_synth_strings_2',
//   'gm_taiko_drum','gm_telephone','gm_tenor_sax','gm_timpani','gm_tinkle_bell','gm_tremolo_strings',
//   'gm_trombone','gm_trumpet','gm_tuba','gm_tubular_bells','gm_vibraphone','gm_viola','gm_violin',
//   'gm_voice_oohs','gm_whistle','gm_woodblock','gm_xylophone'
// ];

// register('gm', (index, pat) => {
//   return pat
//   .sound(GM[index])
// })

// // --- Example usage ---
// n("0 2 4 5 7 9 11 12")
//   .scale('C4:minor')
//   .gm(range(0, 125))
