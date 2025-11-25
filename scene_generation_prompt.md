# Scene Generation Prompt (Generalised)

## 🎨 Purpose
Use this prompt to generate any scene based on a set of vocabulary words.  
The output style **must** match the visual style shown in the reference screenshot:  
- Child‑friendly  
- Clean digital line sketch  
- Single medium‑blue line colour  
- Very light blue‑white background  
- Minimal detail  
- No shading, gradients, or 3D  
- No text, labels, or characters  

---

# ✅ **Generalised Scene Generation Prompt**

```
Create a simple, child-friendly line drawing of a **{SCENE_WORD}**.

Include the following objects clearly and recognisably in the scene:
**{OBJECT_LIST}**

Composition notes:
- Arrange the objects in positions that make sense inside a {SCENE_WORD}.
- Ensure each object is clear, distinct, and easy for a child to identify.
- Keep the scene calm and uncluttered.

Style requirements:
- Clean digital sketch using **one medium-blue line colour**
- **Very light blue‑white background**
- Consistent line weight
- No shading, no gradients, no textures, no realistic rendering
- No text, no labels, no humans or animals
- Use faint background structure lines (e.g., shelves, walls, counters) only if they help context

Overall tone:
- Friendly, simple, educational illustration for children.
```

---

# 📌 **Examples by Set**

## Example 1 — Kitchen Set  
Words: `knife, spoon, stove, plate, fork`  
Scene Word: `kitchen`

```
Create a simple, child-friendly line drawing of a kitchen.

Include the following objects clearly and recognisably in the scene:
- a serrated kitchen knife leaning upright on the left
- a two-burner gas stove in the center with small flames
- a spoon on the countertop to the right
- two plates placed in the foreground

Composition:
- Place the stove in the centre
- Plates should be in front, near the bottom
- Knife leaning on the left side of stove
- Spoon on the right
- Add faint outlines of kitchen cupboards and counters in the background

Style:
- Single medium-blue sketch lines
- Very light blue-white background
- Minimal detail, no shading, no gradients
- No text, no characters
```

---

## Example 2 — Garden Set  
Words: `leaf, flower, pot, tree`  
Scene Word: `garden`

```
Create a simple, child-friendly line drawing of a garden.

Include the following objects clearly and recognisably:
- a small potted plant on the left
- a blooming flower next to it
- a medium tree in the background
- a large leaf in the foreground on the right

Composition:
- Tree at back centre
- Pot + flower on left
- Leaf in front, slightly angled
- Optionally add faint outlines of soil or grass

Style:
- Medium-blue continuous sketch lines
- Very light blue-white background
- No shading, no gradients, no text
```

---

## Example 3 — Classroom Set  
Words: `book, pencil, bag, chair`  
Scene Word: `classroom`

```
Create a simple, child-friendly line drawing of a classroom.

Include:
- a chair centred in the scene
- a school bag leaning against the chair's left leg
- a book lying open on the desk at centre
- a pencil next to the book

Composition:
- Desk + chair in centre
- Bag leaning on chair
- Book and pencil on desk
- Faint outlines of blackboard or shelves in background

Style:
- Single medium-blue sketch lines
- Very light blue-white background
- Minimal detail, no shading or gradients
- No characters or text
```

---

## 🎯 Notes for Model Parameters

**Recommended settings (DALL·E 3 / Replicate):**  
- Aspect ratio: **16:9**  
- Style strength: medium  
- Remove realism / add simplicity  
- Temperature: 0.4–0.6  
- Disable text generation  
- Emphasise “line sketch” and “children’s educational illustration”  

---

## ✔ File prepared for Cursor usage

This `.md` file can be placed in your repo for generating scenes dynamically using any LLM or image model.
