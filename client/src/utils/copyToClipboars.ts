const copyToClipboard = () => {
	navigator.clipboard.writeText(window.location.href)
}
 
export default copyToClipboard