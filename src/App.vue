<template>
  <h2>测试计算递归无优化的斐波那契数列性能</h2>
  <h3>当值为 {{ n }} 时</h3>
  <span>Javascript实现的斐波那契函数耗费： {{ jsFibonacci }} ms</span>
  <br />
  <span>C实现的斐波那契函数耗费： {{ cFibonacci }} ms</span>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import wasmC from "./add.c";

export default defineComponent({
  name: "App",
  setup() {
    const jsFibonacci = ref();
    const cFibonacci = ref();
    const n = ref(25);
    onMounted(() => {
      wasmC({
        global: {},
        env: {
          memoryBase: 0,
          tableBase: 0,
          memory: new WebAssembly.Memory({ initial: 256 }),
          table: new WebAssembly.Table({ initial: 0, element: "anyfunc" }),
        },
      }).then((result) => {
        const { add, fibonacci } = result.instance.exports;
        console.log("C return value was", add(2, 3));
        console.log("Fibonacci", fibonacci(2));
      });
      doSomething();
    });

    const getExportFunction = async (url) => {
      const env = {
        memoryBase: 0,
        tableBase: 0,
        memory: new WebAssembly.Memory({
          initial: 256,
        }),
        table: new WebAssembly.Table({
          initial: 2,
          element: "anyfunc",
        }),
      };
      const instance = await fetch(url)
        .then((response) => {
          return response.arrayBuffer();
        })
        .then((bytes) => {
          return WebAssembly.instantiate(bytes, { env: env });
        })
        .then((instance) => {
          return instance.instance.exports;
        });

      // const instance = await fetch(url)
      //   .then((response) => {
      //     return WebAssembly.instantiateStreaming(response, { env: env });
      //   })
      //   .then((instance) => {
      //     return instance.instance.exports;
      //   });

      return instance;
    };
    const fibonacci = (n) => {
      if (n <= 1) {
        return n;
      } else {
        return fibonacci(n - 1) + fibonacci(n - 2);
      }
    };

    const doSomething = async () => {
      // console.log(createInstance.toString());
      // const res = await createInstance();
      // console.log(res);
      const fibonacciUrl = "./fibonacci.wasm";
      const { _fibonacci } = await getExportFunction(fibonacciUrl);
      console.log(_fibonacci);
      cFibonacci.value = getDuring(_fibonacci);
      jsFibonacci.value = getDuring(fibonacci);
    };

    const getDuring = (func) => {
      const start = Date.now();
      func(n.value);
      return Date.now() - start;
    };

    return {
      n,
      jsFibonacci,
      cFibonacci,
    };
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
