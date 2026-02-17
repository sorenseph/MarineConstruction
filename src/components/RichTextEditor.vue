<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

const editorRef = ref(null)
const colors = ['#000', '#333', '#666', '#ff5821', '#0056b3', '#28a745', '#dc3545', '#ffc107']

function exec(cmd, value = null) {
  document.execCommand(cmd, false, value)
  editorRef.value?.focus()
  emitContent()
}

function insertImage() {
  const url = prompt('Paste image URL (copy from browser or image host):')
  if (url && url.trim()) exec('insertImage', url.trim())
}

function emitContent() {
  if (editorRef.value) emit('update:modelValue', editorRef.value.innerHTML)
}

watch(() => props.modelValue, (v) => {
  if (editorRef.value && editorRef.value.innerHTML !== v) editorRef.value.innerHTML = v || ''
})

onMounted(() => {
  if (editorRef.value && props.modelValue) editorRef.value.innerHTML = props.modelValue
})
</script>

<template>
  <div class="rich-editor">
    <div class="editor-toolbar">
      <button type="button" @click="exec('bold')" title="Bold"><i class="bi bi-type-bold"></i></button>
      <button type="button" @click="exec('italic')" title="Italic"><i class="bi bi-type-italic"></i></button>
      <button type="button" @click="exec('underline')" title="Underline"><i class="bi bi-type-underline"></i></button>
      <button type="button" @click="exec('strikeThrough')" title="Strikethrough"><i class="bi bi-type-strikethrough"></i></button>
      <span class="sep">|</span>
      <select @change="e => { exec('formatBlock', e.target.value); e.target.value = '' }" title="Headings">
        <option value="">Heading</option>
        <option value="h2">H2</option>
        <option value="h3">H3</option>
        <option value="h4">H4</option>
        <option value="h5">H5</option>
        <option value="p">Paragraph</option>
      </select>
      <span class="sep">|</span>
      <select @change="e => { exec('fontSize', e.target.value); e.target.value = '' }" title="Size">
        <option value="">Size</option>
        <option value="1">Small</option>
        <option value="3">Normal</option>
        <option value="5">Large</option>
        <option value="7">X-Large</option>
      </select>
      <span class="sep">|</span>
      <select @change="e => { if(e.target.value) exec('foreColor', e.target.value); e.target.value = '' }" title="Color">
        <option value="">Color</option>
        <option v-for="c in colors" :key="c" :value="c">■</option>
      </select>
      <span class="sep">|</span>
      <button type="button" @click="exec('justifyLeft')" title="Align left"><i class="bi bi-text-left"></i></button>
      <button type="button" @click="exec('justifyCenter')" title="Center"><i class="bi bi-text-center"></i></button>
      <button type="button" @click="exec('justifyRight')" title="Align right"><i class="bi bi-text-right"></i></button>
      <span class="sep">|</span>
      <button type="button" @click="exec('insertUnorderedList')" title="Bullets"><i class="bi bi-list-ul"></i></button>
      <button type="button" @click="exec('insertOrderedList')" title="Numbered list"><i class="bi bi-list-ol"></i></button>
      <span class="sep">|</span>
      <button type="button" @click="insertImage" title="Insert image (paste URL)"><i class="bi bi-image"></i></button>
    </div>
    <div
      ref="editorRef"
      class="editor-content"
      contenteditable="true"
      @input="emitContent"
      @paste="emitContent"
    ></div>
  </div>
</template>

<style scoped>
.rich-editor { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
.editor-toolbar {
  display: flex; flex-wrap: wrap; gap: 2px; padding: 8px;
  background: #f8f9fa; border-bottom: 1px solid #ddd;
}
.editor-toolbar button, .editor-toolbar select {
  padding: 6px 10px; border: 1px solid #dee2e6; border-radius: 4px;
  background: #fff; cursor: pointer; font-size: 14px;
}
.editor-toolbar button:hover { background: #e9ecef; }
.editor-toolbar .sep { color: #adb5bd; margin: 0 4px; }
.editor-toolbar select { cursor: pointer; }
.editor-content {
  min-height: 200px; padding: 12px; outline: none;
  font-size: 16px; line-height: 1.5;
}
.editor-content:empty::before { content: 'Write here...'; color: #999; }
.editor-content img { max-width: 100%; height: auto; }
</style>
