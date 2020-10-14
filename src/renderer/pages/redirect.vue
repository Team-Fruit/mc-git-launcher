<template>
  <div></div>
</template>

<script>
let param
let b
export default {
  layout: 'blank',
  fetch({base,query}) {
    param = query.p
    b = base
    //return redirect(redirectPath)
  },
  created() {
    if (param === undefined) {
      //return redirect('/')
    }
    const redirectPath = '/' + param.replace(b, '')
    this.$router.push(redirectPath)
  }
}
</script>
