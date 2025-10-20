#!/bin/bash

ANIME=(
  "imKrSqrDxAuvS" "wVi0fB6VvEuylB896b" "5ZYA31R5OP6JdmVP3f"
  "jUJgL0iByjsAS2MQH1" "nSiNho356rXH2" "V5qXaUBISlbTa"
  "v2WuhMBzb3h5e" "vMSXa7KFGx49aeeXhe" "Ui46FI4nHWyD6"
  "BMu2SwuXflOlQP8jTC" "fUpvkRuLKE4xMBJLvH" "J1KaQ7nz8P0L3O15L7"
  "dSdSQmzlJopuqueF2i" "2SYqgPxMm2kbVe3y02" "2seKKLp1n0sEeJLYTK"
  "451shsqh5nJ9UqDElR" "k5zu35npVsYfgZQwwl" "4DNPcZOIcgnwA"
  "l0K4nA7cpMeUvf2Fi" "3o6EhMvVN4xywtj0w8" "3o7qE3hpYEbxrpvtLO"
  "u4OCfdmLJEkFi" "l0K4ii1UZNuiypB9C" "l0K423YWdCvHeemsg"
  "26vUGqm4LZHmh98LS" "l396JYFnbVdFGQVz2" "26vUBz1PjdxlOf7cQ"
  "3o7qDP1T6zeSFPInPq" "l3975JMDfpxb1Rgcg" "3o7qEaJ6NzOzld8vfO"
  "3o7qDNQuLZ1gOCedQ4" "3o7qE9vHyyP0sdSzyo" "3o7qDOp14xP17OoZby"
  "l0K4bmBeMK9znRTz2" "l396QaDFGgDytJK1y" "ExRFIyExpUKHK"
  "wGUpSQWxnYpji" "lgQ67zBpyNtkOIYQNj" "141IT7TDZlalFu"
  "RpAI6k1xGwZq0" "fsoCk5kgOcYMM" "FqdGGgugkC4Xm"
  "MXoEoAUeBXapi" "WmMMsTJCV2h0Y" "vfg92uVyrc3aU"
  "3osxYlSDn290VbV076" "jAe22Ec5iICCk" "bi6RQ5x3tqoSI"
  "wv1RNuvWMjQ10bzExO" "4ilFRqgbzbx4c" "cVPcABKys8dHy"
  "aZzXDWIjefE5y" "4MxLhxhOqCqYw" "lmdWrAZEBB5TO"
  "euVwF4P2b0sus" "QEhmoTK7GPTkA" "NzbcdfP2B6GKk"
  "l0K48n9FVuc0oo5So" "OiQAbeIgiJEzyrM4p9" "PZrjGkr334fXa"
  "ROUXN6hzDgyf6" "3o7qDXnOvzpiINqjcc" "3Z1kP6uFLMlyfuTA6A"
  "3o7qEa2qFRQ1oTPNtu" "32KRTcz8e7VAXBZjSB" "3o7qDQEzc4uJ2rwsbS"
  "OGikcvL7UAqemQxW88" "41C55ZzL8M00frDXEM" "SuZWJOT85PesdekaUf"
  "LSngi7IrKV4rZJYusZ" "8VJHQE2WDA9RyU3KM5" "LYrd48YmInWnYSjvUK"
  "fu4A9JuTVZV1m" "tXzFpjeqVnE7m" "3o7qE8ozvVB96om9gI"
  "FVWAuCawVHazvo4sFJ" "ATNaKsgb4OktNdJnnX" "udK21RQeWtaGQ"
  "J1KaQ7nz8P0L3O15L7" "vFtxhHXy6tckXPaoKd" "y8IjAb0W8e6yyTKlja"
  "l396YgwezVAGsNCNi" "26vUKL7zxr5RLafVS" "xT4uQBsGHPxvxIvl7i"
  "l0K4dsf12j6MbZrIA" "3o7qDDEkCIHbpjxuhy" "26vUwr71xcR4uimQ0"
  "3o7qE9UzPqInSrDFok" "l0K46Q4CZ7FZl7Q40" "3o7qDOVITVjuHjBSXS"
  "l0K4bmBeMK9znRTz2"
)

mkdir -p anime

for id in "${ANIME[@]}"; do
  url="https://media.giphy.com/media/$id/giphy.mp4"
  echo "Descargando $url"
  curl -L "$url" -o "gifs/$id.mp4"
done
