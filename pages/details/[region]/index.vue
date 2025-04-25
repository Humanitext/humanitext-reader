<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();

    //console.log(route.params.region);
    // sparql endpointから取得した地域名のリスト
    //const endpoint = "http://54.92.185.36:3030/humanitext_reader/sparql";
    const endpoint = "https://dydra.com/junjun7613/humanitextonto/sparql";
    const query = `
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

      SELECT DISTINCT ?authorLabel WHERE {
        ?sub a <http://example.org/vocabulary/Commentary> .
        ?sub <http://example.org/vocabulary/hasRegion> "${route.params.region}" .
        ?sub <http://example.org/vocabulary/references> ?text .
        ?text <http://purl.org/dc/elements/1.1/creator> ?author .
        ?author rdfs:label ?authorLabel .
      }
    `;
    const url = `${endpoint}?query=${encodeURIComponent(query)}&format=json`;
    const authors = ref([]);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        console.log(data);
        data.results.bindings.forEach((binding) => {
          authors.value.push(binding.authorLabel.value);
        });
      });
    console.log(authors.value);

    //const authors = ref(["Aristotle", "Plato", "Caesar"]);
    const selectedAuthor = ref("all");

    const handleConfirm = () => {
      if (selectedAuthor.value !== "all") {
        console.log(selectedAuthor.value);
        // 現階層の下位にselectedAuthor.valueを繋げる形で遷移
        router.push(`/details/${route.params.region}/${selectedAuthor.value}`);
      }
    };

    return {
      route,
      authors,
      selectedAuthor,
      handleConfirm
    };
  }
};
</script>

<template>
  <v-container fluid>
    <h1 class="header">Selected Region: {{ route.params.region }}</h1>
    <v-row>
      <v-col cols="12" md="6">
        <div>
          <div class="selectTheme">
            <label for="author">Select the Author: </label>
            <select id="author" v-model="selectedAuthor">
              <option value="all"> </option>
              <option v-for="author in authors" :value="author">{{ author }}</option>
            </select>
            <p>Selected Author: {{ selectedAuthor }}</p>
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
