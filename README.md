
# Flashcard plugin for silverbullet.md


This repository is inspired by [st3v3nmw/obsidian-spaced-repetition](https://github.com/st3v3nmw/obsidian-spaced-repetition)

## Features

Create flashcards from your notes.

Currently this plugin is statless so it doesn't define priority in card. (Plan in the future)

Working:
- Single-line reversed style (Question:::Answer)
- Multi-line style (Separated by ?)

Work in Progress:
- Decks hierarchy
- Cloze cards (==highlight== your cloze deletions!, **bolded text**, {{text in curly braces}}, or use custom cloze patterns)

## Installation
If you would like to install this plug straight from Github, make sure you have the `.js` file committed to the repo and simply add

```
- github:jhanos/flashcard/flashcard.plug.js
```

to your `PLUGS` file, run `Plugs: Update` command and off you go!

## How To

1. Add the tag flashcards ( #flashcards in your note or in the frontmatter)
2. Create multiple notes using:
  - Single-line reversed style (Question:::Answer)
  - Multi-line style (Separated by ?)
3. Launch "Flashcards" command from "run command" or ctrl + shift + /


## Example

```md
#flashcards

# Learning French 

manger::eat

jouet::toy

Some random text

aller à l'essentiel
?
cut to chase
get to the heart of the matter


some new random text

enfant:: child

some random text
```
