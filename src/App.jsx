import "./index.css"


function App(){
  return(
    <div className="container">
      <h1>Skill Tracker</h1>
      <p>Track your self-learning journey.</p>
      <form>
        <label>Skill Name</label>
        <input type="text" 
               placeholder="Enter skill name" 
               class="skill-input"/>

        
        <label>Category</label>
        <select class= "skill-dropdown">
          <option>Frontend Web</option>
          <option>Backend</option>
          <option>Mobile Development</option>
          <option>AI/MAchine Learning</option>
          <option>CyberSecurity</option>
          <option>QA</option>
          <option>Product Management</option>
          <option>IOT</option>
        </select>

      <label>Level</label>
      <select class= "level-dropdown">
        <option>Beginner</option>
        <option>Intermediate</option>
        <option>Advanced</option>
      </select>

      <label>Target Date</label>
      <input type="date"
             class="target-input"/>

      <button type="submit">Add Skill</button>
      </form>

    </div>
    
  );
}

export default App;