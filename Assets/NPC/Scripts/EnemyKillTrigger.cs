using UnityEngine;

public class GroundCheck : MonoBehaviour
{

    public float bounceSpeed = 10;

    private void OnTriggerEnter2D(Collider2D collision)
    {
        if (collision.CompareTag("Enemy"))
        {
            Destroy(collision.gameObject); 
            Rigidbody2D body = this.GetComponentInParent<Rigidbody2D>();
            body.linearVelocity = new Vector2(body.linearVelocityX, bounceSpeed);
        }
        else if (collision.CompareTag("SpikyEnemy"))
        {
            Debug.Log("Ouch!");
        }
    }

}

