<template>
  <div>
        <p>{{@title}}</p>
        <p>{{@body}}</p>
        <div>
          <button {{on "click" @close}}>Close</button>
        </div>
      </div>
</template>