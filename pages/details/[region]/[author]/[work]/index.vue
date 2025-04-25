<template>
    <v-container fluid>
    <h1 class="header">Selected Work: {{ route.params.work }}</h1>
    <v-row>
      <v-col cols="12" md="6">
        <div>
          <div class="selectTheme">
            <label for="book">Select the Book: </label>
            <select id="book" v-model="selectedBook">
              <option value="all"> </option>
              <option v-for="book in books" :value="book">{{ book }}</option>
            </select>
            <p>Selected Book: {{ selectedBook }}</p>
            <button style="border: 5px;" @click="handleConfirm">
              確定</button>
          </div>
        </div>
      </v-col>
      <v-col cols="12" md="6">
        
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    //const works = ref(["Politics", "Metaphysics", "De Bello Gallico"]);
    const books = ref([]);
    const selectedBook = ref("all");
    const route = useRoute();
    const router = useRouter();

    //const endpoint = "http://54.92.185.36:3030/humanitext_reader/sparql";
    const endpoint = "https://dydra.com/junjun7613/humanitextonto/sparql";
    const query = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

        SELECT DISTINCT ?book WHERE {
        ?work a <http://example.org/vocabulary/Work> ;
                rdfs:label "${route.params.work}" .
        ?text a <http://example.org/vocabulary/Text>;
            <http://example.org/vocabulary/correspondingWork> ?work ;
            <http://example.org/vocabulary/correspondingBook> ?book .
        }
    `;
    const url = `${endpoint}?query=${encodeURIComponent(query)}&format=json`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        console.log(data);
        data.results.bindings.forEach((binding) => {
          books.value.push(binding.book.value);
        });
      });
    console.log(books.value);

    const handleConfirm = () => {
      if (selectedBook.value !== "all") {
        console.log(selectedBook.value);
        // 現階層の下位にselectedAuthor.valueを繋げる形で遷移
        router.push(`/details/${route.params.region}/${route.params.author}/${route.params.work}/${selectedBook.value}`);
      }
    };

    return {
      route,
      books,
      selectedBook,
      handleConfirm
    };
  }
};
</script>

<style scoped>
.selectTheme {
  color: black;
  font-size: 24px;
  text-align: left;
  font-family: Georgia, 'Times New Roman', Times, serif;
}
.header {
  font-family: Georgia, 'Times New Roman', Times, serif;
}
button {
  background-color: #4CAF50; /* Green */
  border: none;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 20px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 5px; /* 角を丸くする */
}
</style>