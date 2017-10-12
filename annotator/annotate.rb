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
    if @hsk[1].include?(word)
      1
    elsif @hsk[2].include?(word)
      2
    elsif @hsk[3].include?(word)
      3
    elsif @hsk[4].include?(word)
      4
    elsif @hsk[5].include?(word)
      5
    elsif @hsk[6].include?(word)
      6
    else
      "&infin;"
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
    '<html><head><link rel="stylesheet" href="bootstrap.min.css"><link rel="stylesheet" type="text/css" href="style.css"></head><body>'
  end

  def htmlEnd
    "<script src=\"jquery-3.2.1.slim.min.js\"></script><script src=\"popper.min.js\"></script><script src=\"bootstrap.min.js\"></script><script type=\"text/javascript\">$(function () {$('[data-toggle=\"tooltip\"]').tooltip()})\n$(function () {$('[data-toggle=\"popover\"]').popover()})</script></body></html>"
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

    list << "<div class=\"b\">Vocabulary (#{@vocab.size} items)</div>"

    @vocab.each do |word|
      entries = @dict.entries(word)
      entries_strings = entries.map{|e| "<div class=\"entry\"><span class=\"trad\">[#{e[:trad]}]</span> <span class=\"pinyin\">#{e[:pinyin]}</span> <span class=\"defi\">#{e[:defi].join('; ')}</span></div>"}

      list << "<div class=\"item\"><div class=\"word\">#{word} <h4>[HSK #{entries.first[:hsk]}]</h4></div>#{entries_strings.join('')}</div>"
    end

    list << "</div>"

    list
  end

  def annotate(file)
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
a.annotate(ARGV.first)


# puts "Loading dictionary..."
# dict = {}
# File.open("data/cedict.u8", "r") do |d|
#   counts = {}
#   while line = d.gets
#     line.strip!
#     next if line == '' or line.start_with?("#")
#
#     tokens = line.split(' ')
#
#     trad = tokens.first
#     simp = tokens[1]
#
#     uni = "，"
#     pinyin_raw = line.match(/\[[a-zA-Z0-9[:punct:] ]*?\]/).to_s
#     pinyin = PinyinToneConverter.number_to_utf8(pinyin_raw[1..-2])
#
#     defi_raw = line.match(/\/.*\//).to_s
#     defi = defi_raw[1..-2].split("/")
#
#     if dict[simp.length].nil?
#       dict[simp.length] = {}
#     else
#       if dict[simp.length][simp].nil?
#         dict[simp.length][simp] = [{
#           trad: trad,
#           pinyin: pinyin,
#           defi: defi
#         }]
#       else
#         dict[simp.length][simp] << {
#           trad: trad,
#           pinyin: pinyin,
#           defi: defi
#         }
#       end
#     end
#
#     if counts[tokens.first.size].nil?
#      counts[tokens.first.size] = 1
#    else
#      counts[tokens.first.size] += 1
#    end
#
#   end
#   puts counts.inspect
# end
#
# puts "Annotating document..."
# File.open("out/out.txt", "r") do |f|
#   File.open("out/out.html", "w") do |o|
#     o.puts '<html><head>'
#     o.puts '<link rel="stylesheet" href="bootstrap.min.css">'
#     o.puts '<link rel="stylesheet" type="text/css" href="style.css">'
#     o.puts '</head><body>'
#
#     while line = f.gets
#       tokens = line.split(' ')
#
#       if tokens.size > 0
#         o.print "<p>"
#
#         tokens.each do |t|
#           entries = dict[t.length][t] rescue nil
#
#           if !entries.nil?
#             pinyin_set = Set.new
#             defi_set = Set.new
#             entries.each do |e|
#               pinyin_set.add e[:pinyin]
#               defi_set.add e[:defi].map{|i| "<li>#{i}</li>"}.join('')
#             end
#             pinyin_string = pinyin_set.to_a.join(" | ")
#             defi_string = defi_set.to_a.join('').gsub('"', '')
#
#             o.print "<span class=\"simplified\" data-toggle=\"popover\" data-html=\"true\" data-trigger=\"hover\" title=\"#{pinyin_string}\" data-delay=\"300\" data-placement=\"bottom\" data-content=\"<ul>#{defi_string}</ul>\">#{t}</span>"
#             # o.print "<span class=\"simplified\" delay=\"1000\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"#{pinyin_string}\">#{t}</span></span>"
#           else
#             puts "Split #{t}"
#             chars = t.split ''
#             puts chars.inspect
#             chars.each do |c|
#               entries2 = dict[c.length][c] rescue nil
#
#               if !entries2.nil?
#                 pinyin_set = Set.new
#                 defi_set = Set.new
#                 entries2.each do |e2|
#                   pinyin_set.add e2[:pinyin]
#                   defi_set.add e2[:defi].map{|i| "<li>#{i}</li>"}.join('')
#                 end
#                 pinyin_string = pinyin_set.to_a.join(" | ")
#                 defi_string = defi_set.to_a.join('').gsub('"', '')
#
#                 o.print "<span class=\"simplified\" data-toggle=\"popover\" data-html=\"true\" data-trigger=\"hover\" title=\"#{pinyin_string}\" data-delay=\"300\" data-placement=\"bottom\" data-content=\"#{defi_string}\">#{c}</span>"
#                 # o.print "<span class=\"simplified\" delay=\"0\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"#{pinyin_string}\">#{c}</span>"
#               else
#                 o.print c
#               end
#             end
#           end
#         end
#
#         o.puts "</p>"
#       end
#     end
#
#     o.puts '<script src="jquery-3.2.1.slim.min.js"></script>'
#     o.puts '<script src="popper.min.js"></script>'
#     o.puts '<script src="bootstrap.min.js"></script>'
#     o.puts '<script type="text/javascript">'
#     o.puts '$(function () {$(\'[data-toggle="tooltip"]\').tooltip()})'
#     o.puts '$(function () {$(\'[data-toggle="popover"]\').popover()})'
#     o.puts '</script>'
#
#     o.puts "</body></html>"
#   end
# end
# puts "Done!"
