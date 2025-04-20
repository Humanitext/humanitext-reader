<template>
  <v-container fluid>
    <h1 class="header">Selected Author: {{ route.params.author }}</h1>
    <v-row>
      <v-col cols="12" md="6">
        <div>
          <div class="selectTheme">
            <label for="work">著作を選択してください</label>
            <select id="work" v-model="selectedWork">
              <option value="all"> </option>
              <option v-for="work in works" :value="work">{{ work }}</option>
            </select>
            <p>選択中の著作: {{ selectedWork }}</p>
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
    const works = ref([]);
    const selectedWork = ref("all");
    const route = useRoute();
    const router = useRouter();

    //const endpoint = "http://54.92.185.36:3030/humanitext_reader/sparql";
    const endpoint = "https://dydra.com/junjun7613/humanitextonto/sparql";
    const query = `
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

      SELECT DISTINCT ?workLabel WHERE {
        ?author rdfs:label "Aristotle" .
        ?work a <http://example.org/vocabulary/Work> ;
                <http://purl.org/dc/elements/1.1/creator> ?author .
        ?work rdfs:label ?workLabel .
      }
    `;
    const url = `${endpoint}?query=${encodeURIComponent(query)}&format=json`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        console.log(data);
        data.results.bindings.forEach((binding) => {
          works.value.push(binding.workLabel.value);
        });
      });
    console.log(works.value);

    const handleConfirm = () => {
      if (selectedWork.value !== "all") {
        console.log(selectedWork.value);
        // 現階層の下位にselectedAuthor.valueを繋げる形で遷移
        router.push(`/details/${route.params.region}/${route.params.author}/${selectedWork.value}`);
      }
    };

    return {
      route,
      works,
      selectedWork,
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
</style>
