using UnityEngine;

public class Collectible : MonoBehaviour
{
     private PlayerMovement playerMovement;
    // Start is called before the first frame update
    void Start()
    {
        
    }

    void OnTriggerEnter2D(Collider2D other)
{

    if (other.CompareTag("Player"))
    {
        Debug.Log("✅ Player collected the item!");
        PlayerMovement.Instance.AddCoins();  // Call the AddCoins method from the Player class
        Destroy(gameObject);  // Destroy the collectible when the player collides with it
    }
    else
    {
        Debug.Log("❌ This is not the player. Object tag: " + other.tag);
    }
}


    // Update is called once per frame
    void Update()
    {
        
    }
}
