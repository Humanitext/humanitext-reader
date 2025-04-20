<template>
	<div>
		<nav>
			<ul>
				<li>
					<nuxt-link to="/">Reader</nuxt-link>
				</li>
				<li>
					<nuxt-link to="/help">Help</nuxt-link>
				</li>
				<li class="mr-4">
				</li>
			</ul>
		</nav>
	</div>
</template>
<script>
	export default {
		components: {}
	};
</script>
<style lang="scss" scoped>
nav {
	color: #040404;
	ul {
		display: flex;
		justify-content: flex-end;
		li {
			list-style-type: none;
			margin-left: 15px;
			a {
				color: #060606;
			}
		}
	}
}
</style>