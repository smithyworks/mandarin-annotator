require 'set'
require_relative 'lib/converter/pinyin_tone_converter.rb'

class HSK

  def initialize(hsk_files)
    @hsk = {}

    (1..6).each do |level|
      @hsk[level] = []

      File.open(hsk_files[level-1]) do |f|
        while line = f.gets
          line.strip!
          next if line == ''

          @hsk[level] << line
        end
      end
    end
  end

  def getLevel(word)
    if @hsk[1].include?(word) or (word.length == 1 and @hsk[1].any?{|i| i.include?(word)})
      1
    elsif @hsk[2].include?(word) or (word.length == 1 and @hsk[2].any?{|i| i.include?(word)})
      2
    elsif @hsk[3].include?(word) or (word.length == 1 and @hsk[3].any?{|i| i.include?(word)})
      3
    elsif @hsk[4].include?(word) or (word.length == 1 and @hsk[4].any?{|i| i.include?(word)})
      4
    elsif @hsk[5].include?(word) or (word.length == 1 and @hsk[5].any?{|i| i.include?(word)})
      5
    elsif @hsk[6].include?(word) or (word.length == 1 and @hsk[6].any?{|i| i.include?(word)}) 
      6
    else
      "∞"
    end
  end
end

class Dictionary

  def initialize(file)
    hsk = HSK.new(["data/hsk1.txt", "data/hsk2.txt", "data/hsk3.txt", "data/hsk4.txt", "data/hsk5.txt", "data/hsk6.txt"])

    puts "Loading dictionary file: #{file}..."
    @dict = {}
    File.open(file, "r") do |d|
      while line = d.gets
        line.strip!
        next if line == '' or line.start_with?("#")

        tokens = line.split(' ')
        trad = tokens.first
        simp = tokens[1]

        pinyin_raw = line.match(/\[[a-zA-Z0-9[:punct:] ]*?\]/).to_s
        pinyin = PinyinToneConverter.number_to_utf8(pinyin_raw[1..-2])
        defi_raw = line.match(/\/.*\//).to_s
        defi = defi_raw[1..-2].split("/")

        hsk_level = hsk.getLevel(simp)

        if @dict[simp.length].nil?
          @dict[simp.length] = {}
        else
          if @dict[simp.length][simp].nil?
            @dict[simp.length][simp] = [{
              trad: trad,
              pinyin: pinyin,
              defi: defi,
              hsk: hsk_level
            }]
          else
            @dict[simp.length][simp] << {
              trad: trad,
              pinyin: pinyin,
              defi: defi,
              hsk: hsk_level
            }
          end
        end
      end
    end
  end

  def entries(word)
    @dict[word.length][word].reverse rescue nil
  end

end

class Annotator

  def initialize
    @dict = Dictionary.new("data/cedict.u8")
    @vocab = Set.new
  end

  def htmlBegin
    '<html><head><meta name="viewport" content="width=device-width, initial-scale=0.7"><link rel="stylesheet" href="bootstrap.min.css"><link rel="stylesheet" type="text/css" href="style.css"><link rel="stylesheet" type="text/css" href="font-awesome-4.7.0/css/font-awesome.min.css"></head><body>'
  end

  def htmlEnd
    "<script src=\"jquery-3.2.1.slim.min.js\"></script><script src=\"popper.min.js\"></script><script src=\"bootstrap.min.js\"></script><script src=\"script.js\"></script><script type=\"text/javascript\">$(function () {$('[data-toggle=\"tooltip\"]').tooltip()})\n$(function () {$('[data-toggle=\"popover\"]').popover()})</script></body></html>"
  end

  def entryHtml(word, entry)
    trad = entry[:trad]
    pinyin = entry[:pinyin]
    definitions = entry[:defi].map{|i| "<li>#{i}</li>"}.join('').gsub('"', '')

    "<h5>#{word} | #{trad}</h5><h6>#{pinyin}</h6><ul>#{definitions}</ul>"
  end

  def wordToHtml(word)
    entries = @dict.entries(word)

    if !entries.nil?
      definitionList = []
      entries.each do |e|
        definitionList << entryHtml(word, e)
      end

      @vocab << word

      "<span class=\"simplified\" data-toggle=\"popover\" data-html=\"true\" data-trigger=\"hover\" data-delay=\"300\" data-placement=\"bottom\" data-content=\"#{definitionList.join('')}\">#{word}</span>"
    else
      if word.length > 1
        puts "Splitting #{word}..."

        html = []
        chars = word.split('')
        chars.each do |c|
          html << wordToHtml(c)
        end

        html.join('')
      else
        word
      end
    end
  end

  def vocabHtml
    list = []
    list << "<div class=\"vocab\">"

    list << '<div class="b">Vocabulary (<span id="vocab-count"></span> items)</div>'
    list << '<div class="hsk-toggles">'
    list << '<span id="toggle-1" class="hsk-toggle toggle"><span class="check-cross"><i class="fa fa-check" aria-hidden="true"></i></span> HSK 1</span>'
    list << '<span id="toggle-2" class="hsk-toggle toggle"><span class="check-cross"><i class="fa fa-check" aria-hidden="true"></i></span> HSK 2</span>'
    list << '<span id="toggle-3" class="hsk-toggle toggle"><span class="check-cross"><i class="fa fa-check" aria-hidden="true"></i></span> HSK 3</span>'
    list << '<span id="toggle-4" class="hsk-toggle toggle"><span class="check-cross"><i class="fa fa-check" aria-hidden="true"></i></span> HSK 4</span>'
    list << '<span id="toggle-5" class="hsk-toggle toggle"><span class="check-cross"><i class="fa fa-check" aria-hidden="true"></i></span> HSK 5</span>'
    list << '<span id="toggle-6" class="hsk-toggle toggle"><span class="check-cross"><i class="fa fa-check" aria-hidden="true"></i></span> HSK 6</span>'
    list << '<span id="toggle-0" class="hsk-toggle toggle"><span class="check-cross"><i class="fa fa-check" aria-hidden="true"></i></span> HSK &infin;</span>'
    list << '</div>'
    list << '<div class="controls"><span id="toggle-chars" class="toggle"><span class="check-cross"><i class="fa fa-check" aria-hidden="true"></i> Characters</span></div>'

    @vocab.each do |word|
      entries = @dict.entries(word)
      entries_strings = entries.map{|e| "<div class=\"entry\"><span class=\"trad\">[#{e[:trad]}]</span> <span class=\"pinyin\">#{e[:pinyin]}</span> <span class=\"defi\">#{e[:defi].join('; ')}</span></div>"}

      hsk = entries.first[:hsk]
      list << "<div class=\"item hsk#{hsk == "∞" ? 0 : hsk}\"><div class=\"word\">#{word} <h4>[HSK #{hsk}]</h4></div>#{entries_strings.join('')}</div>"
    end

    list << "</div>"

    list
  end

  def annotate(file)
    @vocab = Set.new
    File.open(file, "r") do |f|
      File.open("out/#{File.basename(file)}.html", "w") do |o|
        puts "Annotating file 'out/#{File.basename(file)}.html', outputting to '#{file}.html'..."

        o.puts htmlBegin

        while line = f.gets
          tokens = line.split(' ')

          first = tokens.first
          class_string = ''
          if first == '#'
            class_string = 'class="a"'
            tokens.shift
          elsif first == '##'
            class_string = 'class="b"'
            tokens.shift
          elsif first == '###'
            class_string = 'class="c"'
            tokens.shift
          elsif first == '####'
            class_string = 'class="d"'
            tokens.shift
          end

          if tokens.size > 0
            o.puts "<p #{class_string}>"

            tokens.each do |t|
              o.print wordToHtml(t)
            end

            o.puts "</p>"
          end
        end

        o.puts vocabHtml

        o.puts htmlEnd
      end
    end
  end

end

a = Annotator.new
files = Dir["texts/*.txt"]

files.each do |f|
  a.annotate(f)
end
